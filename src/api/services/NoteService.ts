import Container, { Inject, Service } from 'typedi';
import { Note } from '../entities/Note';
import { MongoRepository, ObjectID } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import { toObjectId } from '../../helpers/toObjectId';
import JobService from './JobService';
import { ErrorHandler } from '../../helpers/ErrorHandler';

@Service()
export default class NoteService extends CRUD<Note> {
  constructor(
    @InjectRepository(Note)
    protected repo: MongoRepository<Note>,
    @Inject('logger')
    protected logger: Logger
  ) {
    super(repo, logger);
  }

  async create(note: Note): Promise<Note> {
    const jobService = Container.get(JobService);
    const job = await jobService.getRepo().findOne(note.jobId.toHexString());
    if (!(job.owner as ObjectID).equals(note.ownerId as ObjectID)) {
      throw new ErrorHandler(
        500,
        'Note ownerId cannot be different to job owner'
      );
    } else if (!(job.board as ObjectID).equals(note.boardId as ObjectID)) {
      throw new ErrorHandler(
        500,
        'Note boardId cannot be different to job board'
      );
    } else {
      const savedNote = await super.create(note);
      Reflect.deleteProperty(savedNote, 'ownerId');
      return savedNote;
    }
  }

  async findByJob(jobId: string | ObjectID): Promise<Note[]> {
    jobId = toObjectId(jobId);
    return await super.find({
      where: {
        jobId: { $eq: jobId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByBoard(boardId: string | ObjectID): Promise<Note[]> {
    boardId = toObjectId(boardId);
    return await super.find({
      where: {
        boardId: { $eq: boardId },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
