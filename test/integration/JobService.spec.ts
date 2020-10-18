import { Container } from 'typedi';
import JobService from '../../src/api/services/JobService';
import databaseLoader from '../../src/loaders/database';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import JobFactory from '../../src/database/factories/JobFactory';
import { Job } from '../../src/api/entities/Job';
import JobSeed from '../../src/database/seeds/JobSeed';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import { Company } from '../../src/api/entities/Company';
import CompanyFactory from '../../src/database/factories/CompanyFactory';
import UserFactory from '../../src/database/factories/UserFactory';
import BoardFactory from '../../src/database/factories/BoardFactory';
import BoardColumnFactory from '../../src/database/factories/BoardColumnFactory';
import { User } from '../../src/api/entities/User';
import { Board } from '../../src/api/entities/Board';
import { BoardColumn } from '../../src/api/entities/BoardColumn';
jest.mock('../../src/logger');

describe('JobService', () => {
  let connection: Connection;
  let mockCompany: Company,
    mockBoardA: Board,
    mockBoardB: Board,
    mockBoardColumnA: BoardColumn,
    mockBoardColumnB: BoardColumn,
    mockUser: User;
  let jobSeed: JobSeed;
  let jobServiceInstance: JobService;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    Container.set('logger', Logger);
    jobServiceInstance = Container.get(JobService);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    mockUser = await new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    ).seedOne();
    mockCompany = await new EntitySeed<Company>(
      connection.getMongoRepository(Company),
      CompanyFactory
    ).seedOne();
    mockBoardA = await new EntitySeed<Board>(
      connection.getMongoRepository(Board),
      BoardFactory
    ).seedOne({ owner: mockUser.id });
    mockBoardB = await new EntitySeed<Board>(
      connection.getMongoRepository(Board),
      BoardFactory
    ).seedOne({ owner: mockUser.id });
    mockBoardColumnA = await new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    ).seedOne();
    mockBoardColumnB = await new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    ).seedOne();
    jobSeed = new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      mockBoardA.id,
      mockBoardColumnA.id,
      mockUser.id
    );
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('create', () => {
    test('Should successfully create a job record', async () => {
      const mockJob = JobFactory({
        company: mockCompany.id,
        board: mockBoardA.id,
        boardColumn: mockBoardColumnA.id,
        owner: mockUser.id,
      });
      const response = await jobServiceInstance.create(mockJob);
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
    });
    test('Should set the correct index and sort order', async () => {
      const mockJob = await jobSeed.seedOne({
        index: 1,
        sortOrder: 1000,
      });
      let mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockJob.board,
        boardColumn: mockJob.boardColumn,
        owner: mockUser.id,
      });
      let response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.index).toEqual(2);
      expect(response.sortOrder).toEqual(2000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockJob.board,
        boardColumn: mockJob.boardColumn,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.index).toEqual(3);
      expect(response.sortOrder).toEqual(3000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockJob.board,
        boardColumn: mockBoardColumnB.id,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.index).toEqual(1);
      expect(response.sortOrder).toEqual(1000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockBoardB.id,
        boardColumn: mockJob.boardColumn,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.index).toEqual(1);
      expect(response.sortOrder).toEqual(1000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockBoardA.id,
        boardColumn: mockBoardColumnA.id,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.index).toEqual(4);
      expect(response.sortOrder).toEqual(4000);
    });
  });
});
