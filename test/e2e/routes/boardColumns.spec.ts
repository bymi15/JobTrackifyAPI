import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import server from '../../../src/server';
import BoardColumnFactory from '../../../src/database/factories/BoardColumnFactory';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { BoardColumn } from '../../../src/api/entities/BoardColumn';
import { User } from '../../../src/api/entities/User';
jest.mock('../../../src/logger');

describe('BoardColumnsRoute', () => {
  let request: any;
  let connection: Connection;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  const baseUrl = '/api/boardColumns';

  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  beforeAll(async () => {
    const app = await server();
    request = supertest(app);
    Container.set('logger', Logger);
    connection = getConnection();
    await connection.dropDatabase();
    boardColumnSeed = new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    );
    const userSeed = new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    );
    const adminUser = await userSeed.seedOne({
      role: 'admin',
      password: 'adminPassword',
    });
    const staffUser = await userSeed.seedOne({
      role: 'staff',
      password: 'staffPassword',
    });
    const normalUser = await userSeed.seedOne({
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
      await connection.getMongoRepository(BoardColumn).clear();
    } catch (err) {}
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /boardColumn', () => {
    it('should return a list of board columns for admin user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].id).toEqual(
        mockBoardColumns.sort()[0].id.toHexString()
      );
      expect(res.body.sort()[0].title).toEqual(
        mockBoardColumns.sort()[0].title
      );
    });
    it('should return a list of board columns for staff user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].id).toEqual(
        mockBoardColumns.sort()[0].id.toHexString()
      );
      expect(res.body.sort()[0].title).toEqual(
        mockBoardColumns.sort()[0].title
      );
    });
    it('should return a list of board columns for normal user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].id).toEqual(
        mockBoardColumns.sort()[0].id.toHexString()
      );
      expect(res.body.sort()[0].title).toEqual(
        mockBoardColumns.sort()[0].title
      );
    });
    it('should return an unauthorized error without an auth token', async () => {
      await boardColumnSeed.seedOne();
      const res = await request.get(baseUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /boardColumns/:id', () => {
    it('should return a board column by id for admin user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockBoardColumns[0].id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumns[0].id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumns[0].title);
    });
    it('should return a board column by id for staff user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockBoardColumns[0].id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumns[0].id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumns[0].title);
    });
    it('should return a board column by id for normal user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockBoardColumns[0].id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumns[0].id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumns[0].title);
    });
    it('should return an internal server error with invalid board column id', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockInvalidId = mockBoardColumn.id
        .toHexString()
        .split('')
        .reverse();
      const res = await request
        .get(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(500);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const res = await request.get(`${baseUrl}/${mockBoardColumn.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /boardColumns/:id', () => {
    it('should successfully delete a company by id for admin user', async () => {
      const mockBoardColumns = await boardColumnSeed.seedMany(3);
      const mockBoardColumnId = mockBoardColumns[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockBoardColumnId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request.get(baseUrl).set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockBoardColumnId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should return a forbidden error for staff user', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const res = await request
        .delete(`${baseUrl}/${mockBoardColumn.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const res = await request
        .delete(`${baseUrl}/${mockBoardColumn.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const res = await request.delete(`${baseUrl}/${mockBoardColumn.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an internal server error with invalid board column id', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockInvalidId = mockBoardColumn.id
        .toHexString()
        .split('')
        .reverse();
      const res = await request
        .delete(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('POST /boardColumns', () => {
    it('should successfully create a board column for admin user', async () => {
      const mockBoardColumn = BoardColumnFactory();
      const mockBody = { title: mockBoardColumn.title };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      const boardColumnId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${boardColumnId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(boardColumnId);
    });
    it('should return a forbidden error for staff user', async () => {
      const mockBoardColumn = BoardColumnFactory();
      const mockBody = { title: mockBoardColumn.title };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockBoardColumn = BoardColumnFactory();
      const mockBody = { title: mockBoardColumn.title };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockBoardColumn = BoardColumnFactory();
      const mockBody = { title: mockBoardColumn.title };
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

  describe('PATCH /boardColumns/:id', () => {
    it('should successfully update a board column for admin user', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockBoardColumnId = mockBoardColumn.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockBoardColumnId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumn.id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumn.title);
      const mockBody = { title: 'mockBoardColumnTitle' };
      res = await request
        .patch(`${baseUrl}/${mockBoardColumnId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
    });
    it('should return a forbidden error for staff user', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockBoardColumnId = mockBoardColumn.id.toHexString();
      const mockBody = { title: 'mockBoardColumnTitle' };
      let res = await request
        .patch(`${baseUrl}/${mockBoardColumnId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .get(`${baseUrl}/${mockBoardColumnId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumn.id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumn.title);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockBoardColumnId = mockBoardColumn.id.toHexString();
      const mockBody = { title: 'mockBoardColumnTitle' };
      let res = await request
        .patch(`${baseUrl}/${mockBoardColumnId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .get(`${baseUrl}/${mockBoardColumnId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockBoardColumn.id.toHexString());
      expect(res.body.title).toEqual(mockBoardColumn.title);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockBoardColumnId = mockBoardColumn.id.toHexString();
      const mockBody = { title: 'mockBoardColumnTitle' };
      const res = await request
        .patch(`${baseUrl}/${mockBoardColumnId}`)
        .send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if title is not a valid string', async () => {
      const mockBoardColumn = await boardColumnSeed.seedOne();
      const mockBoardColumnId = mockBoardColumn.id.toHexString();
      const mockBody = { title: 123 };
      const res = await request
        .patch(`${baseUrl}/${mockBoardColumnId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
