import { Container } from 'typedi';
import BoardService from '../../src/api/services/BoardService';
import databaseLoader from '../../src/loaders/database';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import BoardFactory from '../../src/database/factories/BoardFactory';
import UserFactory from '../../src/database/factories/UserFactory';
import { Board } from '../../src/api/entities/Board';
import BoardSeed from '../../src/database/seeds/BoardSeed';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import { User } from '../../src/api/entities/User';
import { ErrorHandler } from '../../src/helpers/ErrorHandler';
jest.mock('../../src/logger');

describe('BoardService', () => {
  let connection: Connection;
  let boardSeed: BoardSeed;
  let boardServiceInstance: BoardService;
  let mockUser: User;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    Container.set('logger', Logger);
    boardServiceInstance = Container.get(BoardService);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    mockUser = await new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    ).seedOne();
    Reflect.deleteProperty(mockUser, 'password');
    boardSeed = new BoardSeed(
      connection.getMongoRepository(Board),
      mockUser.id
    );
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('create', () => {
    test('Should successfully create and return a board with owner filled by User object', async () => {
      const mockBoard = BoardFactory({
        owner: mockUser.id,
      });
      const response = await boardServiceInstance.create(mockBoard);
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.title).toEqual(mockBoard.title);
      expect(response.owner).toBeDefined();
      expect(response.owner).toEqual(mockUser);
    });
  });

  describe('findByOwner', () => {
    test('Should successfully find all boards by owner', async () => {
      await boardSeed.seedMany(5);
      const response = await boardServiceInstance.findByOwner(mockUser.id);
      expect(response).toBeDefined();
      expect(response.length).toEqual(5);
    });

    test('Should return boards with owner field removed', async () => {
      await boardSeed.seedOne();
      const response = await boardServiceInstance.findByOwner(mockUser.id);
      expect(response).toBeDefined();
      expect(response[0].title).toBeDefined();
      expect(response[0].owner).toBeUndefined();
    });
  });

  describe('find', () => {
    test('Should successfully find all boards', async () => {
      await boardSeed.seedMany(5);
      const response = await boardServiceInstance.find();
      expect(response).toBeDefined();
      expect(response.length).toEqual(5);
    });

    test('Should return boards with owner filled', async () => {
      await boardSeed.seedOne();
      const response = await boardServiceInstance.find();
      expect(response).toBeDefined();
      expect(response[0].owner).toBeDefined();
      expect(response[0].owner).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    test('Should successfully find a board by id', async () => {
      const boards: Board[] = await boardSeed.seedMany(5);
      const response = await boardServiceInstance.findOne(
        boards[1].id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.id).toEqual(boards[1].id);
      expect(response.title).toEqual(boards[1].title);
      expect(response.owner).toEqual(mockUser);
    });

    test('Should return not found error with invalid id', async () => {
      const mockBoardId = '22dba00215a1568fe9310409';
      let err: Error, response: Board;
      try {
        response = await boardServiceInstance.findOne(mockBoardId);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(new ErrorHandler(404, 'Not found'));
    });
  });

  describe('update', () => {
    test('Should successfully update a board by id', async () => {
      const board = await boardSeed.seedOne();
      const mockNewBoard = BoardFactory({ owner: board.owner });
      const response = await boardServiceInstance.update(
        board.id.toHexString(),
        mockNewBoard
      );
      expect(response).toBeDefined();
      expect(response.title).toEqual(mockNewBoard.title);
      expect(response.owner).toEqual(mockUser);
    });

    test('Should successfully update a board by id with only title defined', async () => {
      const board = await boardSeed.seedOne();
      const mockUpdatedFields = { title: 'newTitle' };
      const response = await boardServiceInstance.update(
        board.id.toHexString(),
        mockUpdatedFields
      );
      expect(response).toBeDefined();
      expect(response.title).toEqual(mockUpdatedFields.title);
      expect(response.owner).toEqual(mockUser);
    });
  });
});
