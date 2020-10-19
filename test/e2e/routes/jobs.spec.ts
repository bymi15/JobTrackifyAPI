import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import JobSeed from '../../../src/database/seeds/JobSeed';
import BoardSeed from '../../../src/database/seeds/BoardSeed';
import server from '../../../src/server';
import JobFactory from '../../../src/database/factories/JobFactory';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { Job } from '../../../src/api/entities/Job';
import { User } from '../../../src/api/entities/User';
import { Company } from '../../../src/api/entities/Company';
import { BoardColumn } from '../../../src/api/entities/BoardColumn';
import CompanyFactory from '../../../src/database/factories/CompanyFactory';
import BoardColumnFactory from '../../../src/database/factories/BoardColumnFactory';
import { Board } from '../../../src/api/entities/Board';
jest.mock('../../../src/logger');

describe('JobRoute', () => {
  let request: any;
  let connection: Connection;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  let companySeed: EntitySeed<Company>;
  let jobSeed: JobSeed;
  const baseUrl = '/api/jobs';
  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  let adminUser: User, staffUser: User, normalUser: User;
  let adminBoard: Board, staffBoard: Board, normalBoard: Board;
  let mockCompany: Company, mockBoardColumn: BoardColumn;
  beforeAll(async () => {
    const app = await server();
    request = supertest(app);
    Container.set('logger', Logger);
    connection = getConnection();
    await connection.dropDatabase();
    companySeed = new EntitySeed<Company>(
      connection.getMongoRepository(Company),
      CompanyFactory
    );
    boardColumnSeed = new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    );
    const userSeed = new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    );
    adminUser = await userSeed.seedOne({
      role: 'admin',
      password: 'adminPassword',
    });
    staffUser = await userSeed.seedOne({
      role: 'staff',
      password: 'staffPassword',
    });
    normalUser = await userSeed.seedOne({
      role: 'user',
      password: 'userPassword',
    });
    let res = await request.post('/api/auth/login').send({
      email: adminUser.email,
      password: 'adminPassword',
    });
    adminUserToken = `Bearer ${res.body.token}`;
    res = await request.post('/api/auth/login').send({
      email: staffUser.email,
      password: 'staffPassword',
    });
    staffUserToken = `Bearer ${res.body.token}`;
    res = await request.post('/api/auth/login').send({
      email: normalUser.email,
      password: 'userPassword',
    });
    normalUserToken = `Bearer ${res.body.token}`;
  });

  beforeEach(async () => {
    try {
      await connection.getMongoRepository(Job).clear();
      await connection.getMongoRepository(Company).clear();
      await connection.getMongoRepository(Board).clear();
      await connection.getMongoRepository(BoardColumn).clear();
    } catch (err) {}
    mockCompany = await companySeed.seedOne();
    adminBoard = await new BoardSeed(
      connection.getMongoRepository(Board),
      adminUser.id
    ).seedOne();
    staffBoard = await new BoardSeed(
      connection.getMongoRepository(Board),
      staffUser.id
    ).seedOne();
    normalBoard = await new BoardSeed(
      connection.getMongoRepository(Board),
      normalUser.id
    ).seedOne();
    mockBoardColumn = await boardColumnSeed.seedOne();
    jobSeed = new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      adminBoard.id,
      mockBoardColumn.id,
      adminUser.id
    );
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /jobs', () => {
    it('should return a list of all jobs in order for admin user', async () => {
      const mockJobs = await jobSeed.seedMany(3);
      mockJobs.sort((a, b) =>
        a.sortOrder < b.sortOrder ? -1 : a.sortOrder > b.sortOrder ? 1 : 0
      );
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body[0].id).toEqual(mockJobs[0].id.toHexString());
      expect(res.body[0].title).toEqual(mockJobs[0].title);
    });
    it('should return a forbidden error for staff user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return a forbidden error for normal user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      await jobSeed.seedOne();
      const res = await request.get(baseUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return a job by id for admin user', async () => {
      const mockJobs = await jobSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockJobs[0].id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJobs[0].id.toHexString());
      expect(res.body.title).toEqual(mockJobs[0].title);
    });
    it('should return a job by id for staff user', async () => {
      const mockJobs = await jobSeed.seedMany(3, {
        board: staffBoard.id,
        owner: staffUser.id,
      });
      const res = await request
        .get(`${baseUrl}/${mockJobs[0].id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJobs[0].id.toHexString());
      expect(res.body.title).toEqual(mockJobs[0].title);
    });
    it('should return a job by id for normal user', async () => {
      const mockJobs = await jobSeed.seedMany(3, {
        board: normalBoard.id,
        owner: normalUser.id,
      });
      const res = await request
        .get(`${baseUrl}/${mockJobs[0].id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJobs[0].id.toHexString());
      expect(res.body.title).toEqual(mockJobs[0].title);
    });
    it('should return an internal server error with invalid job id', async () => {
      const mockJob = await jobSeed.seedOne();
      const mockInvalidId = mockJob.id.toHexString().split('').reverse();
      const res = await request
        .get(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(500);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockJob = await jobSeed.seedOne();
      const res = await request.get(`${baseUrl}/${mockJob.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should successfully delete a job by id for admin user', async () => {
      const mockJobs = await jobSeed.seedMany(3);
      const mockJobId = mockJobs[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/user`)
        .set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a job by id for staff user', async () => {
      const mockJobs = await jobSeed.seedMany(3, {
        board: staffBoard.id,
        owner: staffUser.id,
      });
      const mockJobId = mockJobs[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/user`)
        .set({ Authorization: staffUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a job by id for normal user', async () => {
      const mockJobs = await jobSeed.seedMany(3, {
        board: normalBoard.id,
        owner: normalUser.id,
      });
      const mockJobId = mockJobs[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/user`)
        .set({ Authorization: normalUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockJob = await jobSeed.seedOne();
      const res = await request.delete(`${baseUrl}/${mockJob.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an internal server error with invalid job id', async () => {
      const mockJob = await jobSeed.seedOne();
      const mockInvalidId = mockJob.id.toHexString().split('').reverse();
      const res = await request
        .delete(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('POST /jobs', () => {
    it('should successfully create a job for admin user', async () => {
      const mockBody = {
        company: mockCompany.id,
        board: adminBoard.id,
        boardColumn: mockBoardColumn.id,
        title: JobFactory().title,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      const jobId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${jobId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(jobId);
    });
    it('should successfully create a job for staff user', async () => {
      const mockBody = {
        company: mockCompany.id,
        board: staffBoard.id,
        boardColumn: mockBoardColumn.id,
        title: JobFactory().title,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      const jobId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${jobId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(jobId);
    });
    it('should successfully create a job for normal user', async () => {
      const mockBody = {
        company: mockCompany.id,
        board: normalBoard.id,
        boardColumn: mockBoardColumn.id,
        title: JobFactory().title,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      const jobId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${jobId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(jobId);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockJob = JobFactory();
      const mockBody = {
        company: mockJob.company,
        board: mockJob.board,
        boardColumn: mockJob.boardColumn,
        title: mockJob.title,
      };
      const res = await request.post(baseUrl).send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return a validation error if the title field is missing', async () => {
      let res = await request
        .post(baseUrl)
        .send({ title: '' })
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      res = await request
        .post(baseUrl)
        .send({})
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /jobs/:id', () => {
    it('should successfully update a job for admin user', async () => {
      const mockJob = await jobSeed.seedOne();
      const mockJobId = mockJob.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJob.id.toHexString());
      expect(res.body.title).toEqual(mockJob.title);
      const mockBody = { title: 'mockJobTitle' };
      res = await request
        .patch(`${baseUrl}/${mockJobId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
    });
    it('should successfully update a job for staff user', async () => {
      const mockJob = await jobSeed.seedOne({
        board: staffBoard.id,
        owner: staffUser.id,
      });
      const mockJobId = mockJob.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJob.id.toHexString());
      expect(res.body.title).toEqual(mockJob.title);
      const mockBody = { title: 'mockJobTitle' };
      res = await request
        .patch(`${baseUrl}/${mockJobId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
    });
    it('should successfully update a job for normal user', async () => {
      const mockJob = await jobSeed.seedOne({
        board: normalBoard.id,
        owner: normalUser.id,
      });
      const mockJobId = mockJob.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockJobId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockJob.id.toHexString());
      expect(res.body.title).toEqual(mockJob.title);
      const mockBody = { title: 'mockJobTitle' };
      res = await request
        .patch(`${baseUrl}/${mockJobId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockJob = await jobSeed.seedOne();
      const mockJobId = mockJob.id.toHexString();
      const mockBody = { title: 'mockJobTitle' };
      const res = await request.patch(`${baseUrl}/${mockJobId}`).send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if title is not a valid string', async () => {
      const mockJob = await jobSeed.seedOne();
      const mockJobId = mockJob.id.toHexString();
      const mockBody = { title: 123 };
      const res = await request
        .patch(`${baseUrl}/${mockJobId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
