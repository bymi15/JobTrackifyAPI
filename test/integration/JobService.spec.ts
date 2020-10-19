import { Container } from 'typedi';
import JobService from '../../src/api/services/JobService';
import databaseLoader from '../../src/loaders/database';
import { Connection, ObjectID } from 'typeorm';
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
  describe('findByBoard', () => {
    test('Should return a list of jobs by board id in ascending order of sortOrder', async () => {
      const mockJob1 = await jobSeed.seedOne({
        index: 1,
        sortOrder: 2000,
      });
      const mockJob2 = await jobSeed.seedOne({
        index: 2,
        sortOrder: 3000,
      });
      const mockJob3 = await jobSeed.seedOne({
        index: 3,
        sortOrder: 1000,
      });
      const response = await jobServiceInstance.findByBoard(
        mockJob1.board as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(3);
      expect(response[0].id).toEqual(mockJob3.id);
      expect(response[1].id).toEqual(mockJob1.id);
      expect(response[2].id).toEqual(mockJob2.id);
    });
  });
  describe('findByBoardAndColumn', () => {
    test('Should return a list of jobs by board id and board column id', async () => {
      const mockJob1 = await jobSeed.seedOne({
        index: 1,
        sortOrder: 2000,
      });
      const mockJob2 = await jobSeed.seedOne({
        index: 2,
        sortOrder: 3000,
      });
      const mockJob3 = await jobSeed.seedOne({
        index: 3,
        sortOrder: 1000,
      });
      const response = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(3);
      expect(response[0].id).toEqual(mockJob3.id);
      expect(response[1].id).toEqual(mockJob1.id);
      expect(response[2].id).toEqual(mockJob2.id);

      const mockNewJob = JobFactory({
        company: mockJob1.company,
        board: mockJob1.board,
        boardColumn: mockBoardColumnB.id,
        owner: mockJob1.owner,
      });
      const mockJob4 = await jobSeed.seedOne({
        index: 3,
        sortOrder: 1000,
      });
    });
  });
  describe('move', () => {
    test('Should move a job from bottom to top in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        index: 1,
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        index: 2,
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        index: 3,
        sortOrder: 3000,
      });
      //move 3 to 1
      const response = await jobServiceInstance.move(
        mockJob3.id.toHexString(),
        (mockJob3.boardColumn as ObjectID).toHexString()
      );
      console.log(JSON.stringify(response));
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      expect((response.boardColumn as BoardColumn).id).toEqual(
        mockJob3.boardColumn as ObjectID
      );
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      console.log(JSON.stringify(newJobs));
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(3);
      expect(newJobs[0].id).toEqual(mockJob3.id);
      expect(newJobs[1].id).toEqual(mockJob1.id);
      expect(newJobs[2].id).toEqual(mockJob2.id);
    });
  });
});
