import { Container } from 'typedi';
import NoteService from '../../src/api/services/NoteService';
import databaseLoader from '../../src/loaders/database';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import NoteFactory from '../../src/database/factories/NoteFactory';
import { Note } from '../../src/api/entities/Note';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import { ErrorHandler } from '../../src/helpers/ErrorHandler';
import { Company } from '../../src/api/entities/Company';
import { Board } from '../../src/api/entities/Board';
import { BoardColumn } from '../../src/api/entities/BoardColumn';
import { User } from '../../src/api/entities/User';
import { Job } from '../../src/api/entities/Job';
import JobSeed from '../../src/database/seeds/JobSeed';
import CompanyFactory from '../../src/database/factories/CompanyFactory';
import UserFactory from '../../src/database/factories/UserFactory';
import BoardColumnFactory from '../../src/database/factories/BoardColumnFactory';
import BoardSeed from '../../src/database/seeds/BoardSeed';
import NoteSeed from '../../src/database/seeds/NoteSeed';
jest.mock('../../src/logger');

describe('NoteService', () => {
  let connection: Connection;
  let noteSeedA: NoteSeed;
  let noteSeedB: NoteSeed;
  let noteServiceInstance: NoteService;
  let mockCompany: Company,
    mockBoardA: Board,
    mockBoardB: Board,
    mockBoardColumn: BoardColumn,
    mockUserA: User,
    mockUserB: User,
    mockJobA: Job,
    mockJobB: Job;
  let userSeed: EntitySeed<User>;
  let boardColumnSeed: EntitySeed<BoardColumn>;
  let companySeed: EntitySeed<Company>;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
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
    Container.set('logger', Logger);
    noteServiceInstance = Container.get(NoteService);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    mockUserA = await userSeed.seedOne();
    mockUserB = await userSeed.seedOne();
    mockCompany = await companySeed.seedOne();
    mockBoardA = await new BoardSeed(
      connection.getMongoRepository(Board),
      mockUserA.id
    ).seedOne();
    mockBoardB = await new BoardSeed(
      connection.getMongoRepository(Board),
      mockUserB.id
    ).seedOne();
    mockBoardColumn = await boardColumnSeed.seedOne();
    mockJobA = await new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      mockBoardA.id,
      mockBoardColumn.id,
      mockUserA.id
    ).seedOne();
    mockJobB = await new JobSeed(
      connection.getMongoRepository(Job),
      mockCompany.id,
      mockBoardB.id,
      mockBoardColumn.id,
      mockUserB.id
    ).seedOne();
    noteSeedA = new NoteSeed(connection.getMongoRepository(Note), mockJobA);
    noteSeedB = new NoteSeed(connection.getMongoRepository(Note), mockJobB);
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('create', () => {
    test('Should create a note where job owner is same as note owner', async () => {
      const mockNote = NoteFactory({
        ownerId: mockUserA.id,
        boardId: mockBoardA.id,
        jobId: mockJobA.id,
      });
      const response = await noteServiceInstance.create(mockNote);
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.ownerId).toBeUndefined();
      expect(response.body).toEqual(mockNote.body);
      expect(response.boardId).toEqual(mockNote.boardId);
      expect(response.jobId).toEqual(mockNote.jobId);
    });
    test('Should return internal server error when creating a note where job owner differs from note owner', async () => {
      const mockNote = NoteFactory({
        ownerId: mockUserA.id,
        boardId: mockBoardA.id,
        jobId: mockJobB.id,
      });
      let err: Error, response: Note;
      try {
        response = await noteServiceInstance.create(mockNote);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(
        new ErrorHandler(500, 'Note ownerId cannot be different to job owner')
      );
    });
    test('Should return internal server error when creating a note where job board differs from note board', async () => {
      const mockNote = NoteFactory({
        ownerId: mockUserA.id,
        boardId: mockBoardB.id,
        jobId: mockJobA.id,
      });
      let err: Error, response: Note;
      try {
        response = await noteServiceInstance.create(mockNote);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(
        new ErrorHandler(500, 'Note boardId cannot be different to job board')
      );
    });
  });

  describe('findByBoard', () => {
    test('Should return a list of notes by board id in most recent order of createdAt', async () => {
      const mockNotes = await noteSeedA.seedMany(3);
      mockNotes.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );
      const mockNote = await noteSeedB.seedOne();
      let response = await noteServiceInstance.findByBoard(mockBoardA.id);
      expect(response).toBeDefined();
      expect(response.length).toEqual(3);
      expect(response[0].id).toEqual(mockNotes[0].id);
      expect(response[1].id).toEqual(mockNotes[1].id);
      expect(response[2].id).toEqual(mockNotes[2].id);
      response = await noteServiceInstance.findByBoard(mockBoardB.id);
      expect(response).toBeDefined();
      expect(response.length).toEqual(1);
      expect(response[0].id).toEqual(mockNote.id);
    });
  });

  describe('findByJob', () => {
    test('Should return a list of notes by job id in most recent order of createdAt', async () => {
      const mockNotesA = await noteSeedA.seedMany(4);
      mockNotesA.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );
      const mockNotesB = await noteSeedB.seedMany(2);
      mockNotesB.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );
      let response = await noteServiceInstance.findByJob(mockJobA.id);
      expect(response).toBeDefined();
      expect(response.length).toEqual(4);
      expect(response[0].id).toEqual(mockNotesA[0].id);
      expect(response[1].id).toEqual(mockNotesA[1].id);
      expect(response[2].id).toEqual(mockNotesA[2].id);
      expect(response[3].id).toEqual(mockNotesA[3].id);
      response = await noteServiceInstance.findByJob(mockJobB.id);
      expect(response).toBeDefined();
      expect(response.length).toEqual(2);
      expect(response[0].id).toEqual(mockNotesB[0].id);
      expect(response[1].id).toEqual(mockNotesB[1].id);
    });
  });
});
