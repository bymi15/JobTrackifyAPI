import { Container } from 'typedi';
import JobService from '../../src/api/services/JobService';
import databaseLoader from '../../src/loaders/database';
import { Connection, ObjectID } from 'typeorm';
import Logger from '../../src/logger';
import JobFactory from '../../src/database/factories/JobFactory';
import { Job } from '../../src/api/entities/Job';
import JobSeed from '../../src/database/seeds/JobSeed';
import BoardSeed from '../../src/database/seeds/BoardSeed';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import { Company } from '../../src/api/entities/Company';
import CompanyFactory from '../../src/database/factories/CompanyFactory';
import UserFactory from '../../src/database/factories/UserFactory';
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
  let userSeed: EntitySeed<User>;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  let companySeed: EntitySeed<Company>;
  let jobSeed: JobSeed;
  let jobServiceInstance: JobService;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    Container.set('logger', Logger);
    jobServiceInstance = Container.get(JobService);
    companySeed = new EntitySeed<Company>(
      connection.getMongoRepository(Company),
      CompanyFactory
    );
    userSeed = new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    );
    boardColumnSeed = new EntitySeed<BoardColumn>(
      connection.getMongoRepository(BoardColumn),
      BoardColumnFactory
    );
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    mockUser = await userSeed.seedOne();
    mockCompany = await companySeed.seedOne();
    const boardSeed = new BoardSeed(
      connection.getMongoRepository(Board),
      mockUser.id
    );
    mockBoardA = await boardSeed.seedOne();
    mockBoardB = await boardSeed.seedOne();
    mockBoardColumnA = await boardColumnSeed.seedOne();
    mockBoardColumnB = await boardColumnSeed.seedOne();
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
    test('Should set the correct sort order', async () => {
      const mockJob = await jobSeed.seedOne({
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
      expect(response.sortOrder).toEqual(2000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockJob.board,
        boardColumn: mockJob.boardColumn,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(3000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockJob.board,
        boardColumn: mockBoardColumnB.id,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(1000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockBoardB.id,
        boardColumn: mockJob.boardColumn,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(1000);

      mockNewJob = JobFactory({
        company: mockCompany.id,
        board: mockBoardA.id,
        boardColumn: mockBoardColumnA.id,
        owner: mockUser.id,
      });
      response = await jobServiceInstance.create(mockNewJob);
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(4000);
    });
  });
  describe('findByBoard', () => {
    test('Should return a list of jobs by board id in ascending order of sortOrder', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob3 = await jobSeed.seedOne({
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
        sortOrder: 2000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      let response = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(3);
      expect(response[0].id).toEqual(mockJob3.id);
      expect(response[1].id).toEqual(mockJob1.id);
      expect(response[2].id).toEqual(mockJob2.id);

      let mockNewJob = JobFactory({
        company: mockJob1.company,
        board: mockJob1.board,
        boardColumn: mockBoardColumnB.id,
        owner: mockJob1.owner,
        sortOrder: 1000,
      });
      await jobSeed.seedOne(mockNewJob);
      response = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(3);
      response = await jobServiceInstance.findByBoardAndColumn(
        mockNewJob.board as ObjectID,
        mockNewJob.boardColumn as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(1);
      expect(response[0].title).toEqual(mockNewJob.title);

      mockNewJob = JobFactory({
        company: mockJob1.company,
        board: mockBoardB,
        boardColumn: mockJob1.boardColumn,
        owner: mockJob1.owner,
        sortOrder: 1000,
      });
      await jobSeed.seedOne(mockNewJob);
      response = await jobServiceInstance.findByBoardAndColumn(
        mockNewJob.board as ObjectID,
        mockNewJob.boardColumn as ObjectID
      );
      expect(response).toBeDefined();
      expect(response.length).toEqual(1);
      expect(response[0].title).toEqual(mockNewJob.title);
    });
  });
  describe('move', () => {
    test('Should move a job from bottom to top in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(3);
      expect(jobs[0].id).toEqual(mockJob1.id);
      expect(jobs[1].id).toEqual(mockJob2.id);
      expect(jobs[2].id).toEqual(mockJob3.id);

      //move 3 to 1
      const response = await jobServiceInstance.move(
        mockJob3.id.toHexString(),
        (mockBoardA.id as ObjectID).toHexString(),
        (mockBoardColumnA.id as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(3);
      expect(newJobs[0].id).toEqual(mockJob3.id);
      expect(newJobs[1].id).toEqual(mockJob1.id);
      expect(newJobs[2].id).toEqual(mockJob2.id);
    });
    test('Should move a job from top to bottom in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });

      //move 1 to 3
      const response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob3.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(3500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(3);
      expect(newJobs[0].id).toEqual(mockJob2.id);
      expect(newJobs[1].id).toEqual(mockJob3.id);
      expect(newJobs[2].id).toEqual(mockJob1.id);
    });
    test('Should move a job from top to middle in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob4 = await jobSeed.seedOne({
        sortOrder: 4000,
      });

      //move 1 to 3
      const response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob3.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(3500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(4);
      expect(newJobs[0].id).toEqual(mockJob2.id);
      expect(newJobs[1].id).toEqual(mockJob3.id);
      expect(newJobs[2].id).toEqual(mockJob1.id);
      expect(newJobs[3].id).toEqual(mockJob4.id);
    });
    test('Should move a job from middle to top in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob4 = await jobSeed.seedOne({
        sortOrder: 4000,
      });

      //move 3 to 1
      const response = await jobServiceInstance.move(
        mockJob3.id.toHexString(),
        (mockJob3.board as ObjectID).toHexString(),
        (mockJob3.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob3.board as ObjectID,
        mockJob3.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(4);
      expect(newJobs[0].id).toEqual(mockJob3.id);
      expect(newJobs[1].id).toEqual(mockJob1.id);
      expect(newJobs[2].id).toEqual(mockJob2.id);
      expect(newJobs[3].id).toEqual(mockJob4.id);
    });
    test('Should move a job from bottom to middle in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob4 = await jobSeed.seedOne({
        sortOrder: 4000,
      });

      //move 4 to 2
      const response = await jobServiceInstance.move(
        mockJob4.id.toHexString(),
        (mockJob4.board as ObjectID).toHexString(),
        (mockJob4.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(1500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob4.board as ObjectID,
        mockJob4.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(4);
      expect(newJobs[0].id).toEqual(mockJob1.id);
      expect(newJobs[1].id).toEqual(mockJob4.id);
      expect(newJobs[2].id).toEqual(mockJob2.id);
      expect(newJobs[3].id).toEqual(mockJob3.id);
    });
    test('Should move a job from middle to bottom in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob4 = await jobSeed.seedOne({
        sortOrder: 4000,
      });

      //move 2 to 4
      const response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob4.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(4500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob2.board as ObjectID,
        mockJob2.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(4);
      expect(newJobs[0].id).toEqual(mockJob1.id);
      expect(newJobs[1].id).toEqual(mockJob3.id);
      expect(newJobs[2].id).toEqual(mockJob4.id);
      expect(newJobs[3].id).toEqual(mockJob2.id);
    });
    test('Should move a job in between jobs in the same column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const mockJob4 = await jobSeed.seedOne({
        sortOrder: 4000,
      });
      const mockJob5 = await jobSeed.seedOne({
        sortOrder: 5000,
      });

      //move 2 to 4
      const response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob4.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(4500);
      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob2.board as ObjectID,
        mockJob2.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(5);
      expect(newJobs[0].id).toEqual(mockJob1.id);
      expect(newJobs[1].id).toEqual(mockJob3.id);
      expect(newJobs[2].id).toEqual(mockJob4.id);
      expect(newJobs[3].id).toEqual(mockJob2.id);
      expect(newJobs[4].id).toEqual(mockJob5.id);
    });
    test('Should re-align sort order correctly', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });

      let response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(250);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(125);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(62);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(31);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(15);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(7);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(3);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(1);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);

      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(3);
      expect(newJobs[0].id).toEqual(mockJob1.id);
      expect(newJobs[0].sortOrder).toEqual(500);
      expect(newJobs[1].id).toEqual(mockJob2.id);
      expect(newJobs[1].sortOrder).toEqual(1000);
      expect(newJobs[2].id).toEqual(mockJob3.id);
      expect(newJobs[2].sortOrder).toEqual(3000);
    });
    test('Should re-align sort order correctly in between', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });

      let response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2500);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2750);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2875);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2937);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2968);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2984);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2992);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2996);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2998);

      response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        (mockJob2.boardColumn as ObjectID).toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2999);

      response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        (mockJob1.boardColumn as ObjectID).toHexString(),
        mockJob2.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(2500);

      const newJobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(newJobs).toBeDefined();
      expect(newJobs.length).toEqual(3);
      expect(newJobs[0].id).toEqual(mockJob2.id);
      expect(newJobs[0].sortOrder).toEqual(2000);
      expect(newJobs[1].id).toEqual(mockJob1.id);
      expect(newJobs[1].sortOrder).toEqual(2500);
      expect(newJobs[2].id).toEqual(mockJob3.id);
      expect(newJobs[2].sortOrder).toEqual(3000);
    });
    test('Should move a job from top to an empty different column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const response = await jobServiceInstance.move(
        mockJob1.id.toHexString(),
        (mockJob1.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob2.board as ObjectID,
        mockJob2.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(2);
      expect(jobs[0].id).toEqual(mockJob2.id);
      expect(jobs[1].id).toEqual(mockJob3.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJob1.id);
    });
    test('Should move a job from middle to an empty different column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const response = await jobServiceInstance.move(
        mockJob2.id.toHexString(),
        (mockJob2.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob1.board as ObjectID,
        mockJob1.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(2);
      expect(jobs[0].id).toEqual(mockJob1.id);
      expect(jobs[1].id).toEqual(mockJob3.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob2.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJob2.id);
    });
    test('Should move a job from bottom to an empty different column', async () => {
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
      });
      const response = await jobServiceInstance.move(
        mockJob3.id.toHexString(),
        (mockJob3.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob2.board as ObjectID,
        mockJob2.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(2);
      expect(jobs[0].id).toEqual(mockJob1.id);
      expect(jobs[1].id).toEqual(mockJob2.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJob3.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJob3.id);
    });
    test('Should move a job to top of different column', async () => {
      const mockJobA = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJobB = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
        boardColumn: mockBoardColumnB.id,
      });
      const response = await jobServiceInstance.move(
        mockJobA.id.toHexString(),
        (mockJobA.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobB.board as ObjectID,
        mockJobB.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJobB.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobA.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(4);
      expect(jobs[0].id).toEqual(mockJobA.id);
      expect(jobs[0].sortOrder).toEqual(500);
      expect(jobs[1].id).toEqual(mockJob1.id);
      expect(jobs[1].sortOrder).toEqual(1000);
      expect(jobs[2].id).toEqual(mockJob2.id);
      expect(jobs[2].sortOrder).toEqual(2000);
      expect(jobs[3].id).toEqual(mockJob3.id);
      expect(jobs[3].sortOrder).toEqual(3000);
    });
    test('Should move a job to middle of different column', async () => {
      const mockJobA = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJobB = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
        boardColumn: mockBoardColumnB.id,
      });
      const response = await jobServiceInstance.move(
        mockJobA.id.toHexString(),
        (mockJobA.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString(),
        mockJob1.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(1500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobB.board as ObjectID,
        mockJobB.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJobB.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobA.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(4);
      expect(jobs[0].id).toEqual(mockJob1.id);
      expect(jobs[0].sortOrder).toEqual(1000);
      expect(jobs[1].id).toEqual(mockJobA.id);
      expect(jobs[1].sortOrder).toEqual(1500);
      expect(jobs[2].id).toEqual(mockJob2.id);
      expect(jobs[2].sortOrder).toEqual(2000);
      expect(jobs[3].id).toEqual(mockJob3.id);
      expect(jobs[3].sortOrder).toEqual(3000);
    });
    test('Should move a job to bottom of different column', async () => {
      const mockJobA = await jobSeed.seedOne({
        sortOrder: 1000,
      });
      const mockJobB = await jobSeed.seedOne({
        sortOrder: 2000,
      });
      const mockJob1 = await jobSeed.seedOne({
        sortOrder: 1000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob2 = await jobSeed.seedOne({
        sortOrder: 2000,
        boardColumn: mockBoardColumnB.id,
      });
      const mockJob3 = await jobSeed.seedOne({
        sortOrder: 3000,
        boardColumn: mockBoardColumnB.id,
      });
      const response = await jobServiceInstance.move(
        mockJobB.id.toHexString(),
        (mockJobB.board as ObjectID).toHexString(),
        mockBoardColumnB.id.toHexString(),
        mockJob3.id.toHexString()
      );
      expect(response).toBeDefined();
      expect(response.sortOrder).toEqual(3500);
      let jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobA.board as ObjectID,
        mockJobA.boardColumn as ObjectID
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(1);
      expect(jobs[0].id).toEqual(mockJobA.id);
      jobs = await jobServiceInstance.findByBoardAndColumn(
        mockJobB.board as ObjectID,
        mockBoardColumnB.id
      );
      expect(jobs).toBeDefined();
      expect(jobs.length).toEqual(4);
      expect(jobs[0].id).toEqual(mockJob1.id);
      expect(jobs[0].sortOrder).toEqual(1000);
      expect(jobs[1].id).toEqual(mockJob2.id);
      expect(jobs[1].sortOrder).toEqual(2000);
      expect(jobs[2].id).toEqual(mockJob3.id);
      expect(jobs[2].sortOrder).toEqual(3000);
      expect(jobs[3].id).toEqual(mockJobB.id);
      expect(jobs[3].sortOrder).toEqual(3500);
    });
  });
});
