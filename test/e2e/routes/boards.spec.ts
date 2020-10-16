import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import BoardSeed from '../../../src/database/seeds/BoardSeed';
import server from '../../../src/server';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { Board } from '../../../src/api/entities/Board';
import { User } from '../../../src/api/entities/User';
import BoardFactory from '../../../src/database/factories/BoardFactory';
jest.mock('../../../src/logger');

describe('BoardsRoute', () => {
  let request: any;
  let connection: Connection;
  let userSeed: EntitySeed<User>;
  let normalBoardSeed: BoardSeed,
    staffBoardSeed: BoardSeed,
    adminBoardSeed: BoardSeed;
  const baseUrl = '/api/boards';

  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  beforeAll(async () => {
    const app = await server();
    request = supertest(app);
    Container.set('logger', Logger);
    connection = getConnection();
    await connection.dropDatabase();
    userSeed = new EntitySeed<User>(
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

    normalBoardSeed = new BoardSeed(
      connection.getMongoRepository(Board),
      normalUser.id
    );
    staffBoardSeed = new BoardSeed(
      connection.getMongoRepository(Board),
      staffUser.id
    );
    adminBoardSeed = new BoardSeed(
      connection.getMongoRepository(Board),
      adminUser.id
    );
  });

  beforeEach(async () => {
    try {
      await connection.getMongoRepository(Board).clear();
    } catch (err) {}
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /boards', () => {
    it('should return a list of boards for admin user', async () => {
      const mockBoards = await normalBoardSeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].title).toEqual(mockBoards.sort()[0].title);
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
      const res = await request.get(baseUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an unauthorized error with an invalid auth token', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: normalUserToken.replace(/.$/, '') });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /boards/user', () => {
    const ownerUrl = baseUrl + '/user';
    it('should return a list of boards by owner for admin user', async () => {
      await normalBoardSeed.seedOne();
      await staffBoardSeed.seedOne();
      const mockBoards = await adminBoardSeed.seedMany(3);
      const res = await request
        .get(ownerUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].title).toEqual(mockBoards.sort()[0].title);
    });
    it('should return a list of boards by owner for staff user', async () => {
      await normalBoardSeed.seedOne();
      await adminBoardSeed.seedOne();
      const mockBoards = await staffBoardSeed.seedMany(3);
      const res = await request
        .get(ownerUrl)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].title).toEqual(mockBoards.sort()[0].title);
    });
    it('should return a list of boards by owner for normal user', async () => {
      await adminBoardSeed.seedOne();
      await staffBoardSeed.seedOne();
      const mockBoards = await normalBoardSeed.seedMany(3);
      const res = await request
        .get(ownerUrl)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].title).toEqual(mockBoards.sort()[0].title);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const res = await request.get(ownerUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an unauthorized error with an invalid auth token', async () => {
      const res = await request
        .get(ownerUrl)
        .set({ Authorization: normalUserToken.replace(/.$/, '') });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /boards/:id', () => {
    let mockNormalBoard: Board, mockStaffBoard: Board, mockAdminBoard: Board;
    beforeEach(async () => {
      mockNormalBoard = await normalBoardSeed.seedOne();
      mockStaffBoard = await staffBoardSeed.seedOne();
      mockAdminBoard = await adminBoardSeed.seedOne();
    });
    afterEach(async () => {
      await connection
        .getMongoRepository(Board)
        .remove([mockNormalBoard, mockStaffBoard, mockAdminBoard]);
    });
    it('should return any board by id for admin user', async () => {
      let res = await request
        .get(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNormalBoard.id.toHexString());
      expect(res.body.title).toEqual(mockNormalBoard.title);
      res = await request
        .get(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockStaffBoard.id.toHexString());
      expect(res.body.title).toEqual(mockStaffBoard.title);
      res = await request
        .get(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockAdminBoard.id.toHexString());
      expect(res.body.title).toEqual(mockAdminBoard.title);

      const anotherAdminBoard = await new BoardSeed(
        connection.getMongoRepository(Board),
        (await userSeed.seedOne({ role: 'admin' })).id
      ).seedOne();
      res = await request
        .get(`${baseUrl}/${anotherAdminBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(anotherAdminBoard.id.toHexString());
      expect(res.body.title).toEqual(anotherAdminBoard.title);
    });
    it('should return a board by id and forbidden error if not owner for staff user', async () => {
      let res = await request
        .get(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .get(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockStaffBoard.id.toHexString());
      expect(res.body.title).toEqual(mockStaffBoard.title);
      res = await request
        .get(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return forbidden error when trying to access another staff user board', async () => {
      const anotherStaffBoard = await new BoardSeed(
        connection.getMongoRepository(Board),
        (await userSeed.seedOne({ role: 'staff' })).id
      ).seedOne();
      const res = await request
        .get(`${baseUrl}/${anotherStaffBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return a board by id and forbidden error if not owner for normal user', async () => {
      let res = await request
        .get(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNormalBoard.id.toHexString());
      expect(res.body.title).toEqual(mockNormalBoard.title);
      res = await request
        .get(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .get(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return forbidden error when trying to access another normal user board', async () => {
      const anotherNormalBoard = await new BoardSeed(
        connection.getMongoRepository(Board),
        (await userSeed.seedOne({ role: 'user' })).id
      ).seedOne();
      const res = await request
        .get(`${baseUrl}/${anotherNormalBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an internal server error with invalid board id', async () => {
      const invalidBoardId = mockNormalBoard.id
        .toHexString()
        .split('')
        .reverse();
      const res = await request
        .get(`${baseUrl}/${invalidBoardId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(500);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const res = await request.get(`${baseUrl}/${mockNormalBoard.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /boards/:id', () => {
    let mockNormalBoard: Board, mockStaffBoard: Board, mockAdminBoard: Board;
    beforeEach(async () => {
      mockNormalBoard = await normalBoardSeed.seedOne();
      mockStaffBoard = await staffBoardSeed.seedOne();
      mockAdminBoard = await adminBoardSeed.seedOne();
    });
    afterEach(async () => {
      await connection
        .getMongoRepository(Board)
        .remove([mockNormalBoard, mockStaffBoard, mockAdminBoard]);
    });
    it('should successfully delete any board by id for admin user', async () => {
      let res = await request
        .delete(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);

      res = await request
        .delete(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);

      res = await request
        .delete(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a board by id and forbidden error if not owner for staff user', async () => {
      let res = await request
        .delete(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);

      res = await request
        .delete(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(404);

      res = await request
        .delete(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should successfully delete a board by id and forbidden error if not owner for normal user', async () => {
      let res = await request
        .delete(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request
        .get(`${baseUrl}/${mockNormalBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(404);

      res = await request
        .delete(`${baseUrl}/${mockStaffBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);

      res = await request
        .delete(`${baseUrl}/${mockAdminBoard.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const res = await request.delete(`${baseUrl}/${mockNormalBoard.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an internal server error with invalid board id', async () => {
      const invalidBoardId = mockNormalBoard.id
        .toHexString()
        .split('')
        .reverse();
      const res = await request
        .delete(`${baseUrl}/${invalidBoardId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(500);
    });
  });
  describe('POST /boards', () => {
    it('should successfully create a board for admin user', async () => {
      const mockBoard = BoardFactory();
      const mockBody = { title: mockBoard.title };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('owner');
      expect(res.body.owner).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body.title).toEqual(mockBody.title);
      const boardId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${boardId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(boardId);
    });
    it('should successfully create a board for staff user', async () => {
      const mockBoard = BoardFactory();
      const mockBody = { title: mockBoard.title };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('owner');
      expect(res.body.owner).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body.title).toEqual(mockBody.title);
      const boardId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${boardId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(boardId);
    });
    it('should successfully create a board for normal user', async () => {
      const mockBoard = BoardFactory();
      const mockBody = { title: mockBoard.title };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('owner');
      expect(res.body.owner).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body.title).toEqual(mockBody.title);
      const boardId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${boardId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(boardId);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockBoard = BoardFactory();
      const mockBody = { title: mockBoard.title };
      const res = await request.post(baseUrl).send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return a validation error if the title field is missing', async () => {
      const mockBody = { title: '' };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
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
  describe('PATCH /boards/:id', () => {
    let mockNormalBoard: Board, mockStaffBoard: Board, mockAdminBoard: Board;
    beforeEach(async () => {
      mockNormalBoard = await normalBoardSeed.seedOne();
      mockStaffBoard = await staffBoardSeed.seedOne();
      mockAdminBoard = await adminBoardSeed.seedOne();
    });
    afterEach(async () => {
      await connection
        .getMongoRepository(Board)
        .remove([mockNormalBoard, mockStaffBoard, mockAdminBoard]);
    });
    it('should successfully update a board for admin user', async () => {
      const mockBoardId = mockAdminBoard.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockBoardId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual(mockAdminBoard.title);
      const mockBody = {
        title: 'mockBoardTitle',
      };
      res = await request
        .patch(`${baseUrl}/${mockBoardId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      expect(res.body.updatedAt).not.toEqual(mockAdminBoard.updatedAt);
      expect(res.body.createdAt).toEqual(mockAdminBoard.createdAt);
    });
    it('should successfully update a board for staff user', async () => {
      const mockBoardId = mockStaffBoard.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockBoardId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual(mockStaffBoard.title);
      const mockBody = {
        title: 'mockBoardTitle',
      };
      res = await request
        .patch(`${baseUrl}/${mockBoardId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      expect(res.body.updatedAt).not.toEqual(mockStaffBoard.updatedAt);
      expect(res.body.createdAt).toEqual(mockStaffBoard.createdAt);
    });
    it('should successfully update a board for normal user', async () => {
      const mockBoardId = mockNormalBoard.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockBoardId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual(mockNormalBoard.title);
      const mockBody = {
        title: 'mockBoardTitle',
      };
      res = await request
        .patch(`${baseUrl}/${mockBoardId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual(mockBody.title);
      expect(res.body.updatedAt).not.toEqual(mockNormalBoard.updatedAt);
      expect(res.body.createdAt).toEqual(mockNormalBoard.createdAt);
    });
    it('admin user should be able to update any board', async () => {
      const mockBoard = { title: 'mockBoardTitle' };
      let res = await request
        .patch(`${baseUrl}/${mockNormalBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNormalBoard.id.toHexString());
      expect(res.body.title).toEqual(mockBoard.title);
      res = await request
        .patch(`${baseUrl}/${mockStaffBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockStaffBoard.id.toHexString());
      expect(res.body.title).toEqual(mockBoard.title);
      res = await request
        .patch(`${baseUrl}/${mockAdminBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockAdminBoard.id.toHexString());
      expect(res.body.title).toEqual(mockBoard.title);
    });
    it('staff user should only be able to update their own board and otherwise return forbidden error', async () => {
      const mockBoard = { title: 'mockBoardTitle' };
      let res = await request
        .patch(`${baseUrl}/${mockNormalBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .patch(`${baseUrl}/${mockStaffBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockStaffBoard.id.toHexString());
      expect(res.body.title).toEqual(mockBoard.title);
      res = await request
        .patch(`${baseUrl}/${mockAdminBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('normal user should only be able to update their own board and otherwise return forbidden error', async () => {
      const mockBoard = { title: 'mockBoardTitle' };
      let res = await request
        .patch(`${baseUrl}/${mockNormalBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockNormalBoard.id.toHexString());
      expect(res.body.title).toEqual(mockBoard.title);
      res = await request
        .patch(`${baseUrl}/${mockStaffBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .patch(`${baseUrl}/${mockAdminBoard.id}`)
        .send(mockBoard)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const res = await request
        .patch(`${baseUrl}/${mockNormalBoard.id.toHexString()}`)
        .send({ title: 'mockBoardTitle' });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if title is an empty string', async () => {
      const mockBody = { title: '' };
      const res = await request
        .patch(`${baseUrl}/${mockNormalBoard}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if title is not a valid string', async () => {
      const mockBody = { title: 5 };
      const res = await request
        .patch(`${baseUrl}/${mockNormalBoard}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
