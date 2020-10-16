import { Container } from 'typedi';
import BoardColumnService from '../../src/api/services/BoardColumnService';
import databaseLoader from '../../src/loaders/database';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import BoardColumnFactory from '../../src/database/factories/BoardColumnFactory';
import { BoardColumn } from '../../src/api/entities/BoardColumn';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import { ErrorHandler } from '../../src/helpers/ErrorHandler';
jest.mock('../../src/logger');

describe('BoardColumnService', () => {
  let connection: Connection;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  let boardColumnServiceInstance: BoardColumnService;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    boardColumnSeed = new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    );
    Container.set('logger', Logger);
    boardColumnServiceInstance = Container.get(BoardColumnService);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('create', () => {
    test('Should successfully create a boardColumn record', async () => {
      const mockBoardColumn = BoardColumnFactory();
      const response = await boardColumnServiceInstance.create(mockBoardColumn);
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.title).toEqual(mockBoardColumn.title);
    });

    test('Should fail to create a boardColumn record if the boardColumn already exists', async () => {
      const existingBoardColumn = await boardColumnSeed.seedOne();
      let err: ErrorHandler, response: BoardColumn;
      try {
        response = await boardColumnServiceInstance.create(existingBoardColumn);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(
        new ErrorHandler(400, 'The BoardColumn already exists')
      );
    });
  });
});
