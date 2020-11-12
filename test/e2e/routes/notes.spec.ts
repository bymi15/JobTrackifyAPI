import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import NoteSeed from '../../../src/database/seeds/NoteSeed';
import JobSeed from '../../../src/database/seeds/JobSeed';
import BoardSeed from '../../../src/database/seeds/BoardSeed';
import server from '../../../src/server';
import NoteFactory from '../../../src/database/factories/NoteFactory';
import CompanyFactory from '../../../src/database/factories/CompanyFactory';
import BoardColumnFactory from '../../../src/database/factories/BoardColumnFactory';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { Note } from '../../../src/api/entities/Note';
import { User } from '../../../src/api/entities/User';
import { Job } from '../../../src/api/entities/Job';
import { Company } from '../../../src/api/entities/Company';
import { BoardColumn } from '../../../src/api/entities/BoardColumn';
import { Board } from '../../../src/api/entities/Board';
jest.mock('../../../src/logger');

describe('NoteRoute', () => {
  let request: any;
  let connection: Connection;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  let companySeed: EntitySeed<Company>;
  const baseUrl = '/api/notes';
  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  let adminUser: User, staffUser: User, normalUser: User;
  let adminBoard: Board, staffBoard: Board, normalBoard: Board;
  let adminJob: Job, staffJob: Job, normalJob: Job;
  let mockCompany: Company, mockBoardColumn: BoardColumn;
  let normalNoteSeed: NoteSeed,
    staffNoteSeed: NoteSeed,
    adminNoteSeed: NoteSeed;

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
      await connection.getMongoRepository(Note).clear();
      await connection.getMongoRepository(Job).clear();
      await connection.getMongoRepository(Company).clear();
      await connection.getMongoRepository(Board).clear();
      await connection.getMongoRepository(BoardColumn).clear();
    } catch (err) {}
    mockCompany = await companySeed.seedOne();
    mockBoardColumn = await boardColumnSeed.seedOne();
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
    adminJob = await new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      adminBoard.id,
      mockBoardColumn.id,
      adminUser.id
    ).seedOne();
    staffJob = await new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      staffBoard.id,
      mockBoardColumn.id,
      staffUser.id
    ).seedOne();
    normalJob = await new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      normalBoard.id,
      mockBoardColumn.id,
      normalUser.id
    ).seedOne();
    normalNoteSeed = new NoteSeed(
      connection.getMongoRepository(Note),
      normalJob
    );
    staffNoteSeed = new NoteSeed(connection.getMongoRepository(Note), staffJob);
    adminNoteSeed = new NoteSeed(connection.getMongoRepository(Note), adminJob);
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /notes', () => {
    it('should return a list of notes for admin user', async () => {
      await adminNoteSeed.seedOne();
      await staffNoteSeed.seedOne();
      await normalNoteSeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(5);
    });
    it('should return an empty list of notes for admin user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
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
      await normalNoteSeed.seedOne();
      const res = await request.get(baseUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /notes/:id', () => {
    it('should return a note by id for admin user', async () => {
      const mockNotes = await normalNoteSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockNotes[0].id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNotes[0].id.toHexString());
      expect(res.body.body).toEqual(mockNotes[0].body);
    });
    it('should return a note by id for staff user', async () => {
      const mockNotes = await staffNoteSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockNotes[0].id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNotes[0].id.toHexString());
      expect(res.body.body).toEqual(mockNotes[0].body);
    });
    it('should return a note by id for normal user', async () => {
      const mockNotes = await normalNoteSeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockNotes[0].id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNotes[0].id.toHexString());
      expect(res.body.body).toEqual(mockNotes[0].body);
    });
    it('should return an internal server error with invalid note id', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const mockInvalidId = mockNote.id.toHexString().split('').reverse();
      const res = await request
        .get(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(500);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const res = await request.get(`${baseUrl}/${mockNote.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /notes/:id', () => {
    it('should successfully delete a note by id for admin user', async () => {
      const mockNotes = await normalNoteSeed.seedMany(3);
      const mockNoteId = mockNotes[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request.get(baseUrl).set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a note by id for staff user', async () => {
      const mockNotes = await staffNoteSeed.seedMany(3);
      const mockNoteId = mockNotes[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}`)
        .set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a note by id for normal user', async () => {
      const mockNotes = await normalNoteSeed.seedMany(3);
      const mockNoteId = mockNotes[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}`)
        .set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const res = await request.delete(`${baseUrl}/${mockNote.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an internal server error with invalid note id', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const mockInvalidId = mockNote.id.toHexString().split('').reverse();
      const res = await request
        .delete(`${baseUrl}/${mockInvalidId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('POST /notes', () => {
    it('should successfully create a note for admin user', async () => {
      const mockNote = NoteFactory();
      const mockBody = {
        body: mockNote.body,
        jobId: adminJob.id.toHexString(),
        boardId: adminBoard.id.toHexString(),
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.body).toEqual(mockBody.body);
      const noteId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${noteId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(noteId);
    });
    it('should successfully create a note for staff user', async () => {
      const mockNote = NoteFactory();
      const mockBody = {
        body: mockNote.body,
        jobId: staffJob.id.toHexString(),
        boardId: staffBoard.id.toHexString(),
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.body).toEqual(mockBody.body);
      const noteId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${noteId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(noteId);
    });
    it('should successfully create a note for normal user', async () => {
      const mockNote = NoteFactory();
      const mockBody = {
        body: mockNote.body,
        jobId: normalJob.id.toHexString(),
        boardId: normalBoard.id.toHexString(),
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.body).toEqual(mockBody.body);
      const noteId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${noteId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(noteId);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockNote = NoteFactory();
      const mockBody = {
        body: mockNote.body,
        jobId: normalJob.id.toHexString(),
        boardId: normalBoard.id.toHexString(),
      };
      const res = await request.post(baseUrl).send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return a validation error if any required fields are missing', async () => {
      let res = await request
        .post(baseUrl)
        .send({
          body: '',
          jobId: normalJob.id.toHexString(),
          boardId: normalBoard.id.toHexString(),
        })
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      res = await request
        .post(baseUrl)
        .send({})
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /notes/:id', () => {
    it('should successfully update a note for admin user', async () => {
      const mockNote = await adminNoteSeed.seedOne();
      const mockNoteId = mockNote.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockNote.body);
      const mockBody = { body: 'mockNoteBody' };
      res = await request
        .patch(`${baseUrl}/${mockNoteId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockBody.body);
    });
    it('should successfully update a note for staff user', async () => {
      const mockNote = await staffNoteSeed.seedOne();
      const mockNoteId = mockNote.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockNote.body);
      const mockBody = { body: 'mockNoteBody' };
      res = await request
        .patch(`${baseUrl}/${mockNoteId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockBody.body);
    });
    it('should successfully update a note for normal user', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const mockNoteId = mockNote.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockNoteId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockNote.body);
      const mockBody = { body: 'mockNoteBody' };
      res = await request
        .patch(`${baseUrl}/${mockNoteId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNoteId);
      expect(res.body.body).toEqual(mockBody.body);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const mockNoteId = mockNote.id.toHexString();
      const mockBody = { body: 'mockNoteBody' };
      const res = await request
        .patch(`${baseUrl}/${mockNoteId}`)
        .send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if body is not a valid string', async () => {
      const mockNote = await normalNoteSeed.seedOne();
      const mockNoteId = mockNote.id.toHexString();
      const mockBody = { body: true };
      const res = await request
        .patch(`${baseUrl}/${mockNoteId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
