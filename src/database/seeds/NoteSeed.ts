import { MongoRepository, ObjectID } from 'typeorm';
import NoteFactory from '../factories/NoteFactory';
import EntitySeed from './EntitySeed';
import { Note } from '../../api/entities/Note';
import { Job } from '../../api/entities/Job';

export default class NoteSeed {
  private noteSeed: EntitySeed<Note>;
  private ownerId: ObjectID;
  private jobId: ObjectID;
  private boardId: ObjectID;

  constructor(repo: MongoRepository<Note>, job: Job) {
    this.noteSeed = new EntitySeed<Note>(repo, NoteFactory);
    this.ownerId = job.owner as ObjectID;
    this.jobId = job.id;
    this.boardId = job.board as ObjectID;
  }

  public async seedOne(data?: Note): Promise<Note> {
    data = data || new Note();
    data.ownerId = data.ownerId || this.ownerId;
    data.jobId = data.jobId || this.jobId;
    data.boardId = data.boardId || this.boardId;
    return await this.noteSeed.seedOne(data);
  }

  public async seedMany(amount: number): Promise<Note[]> {
    return await this.noteSeed.seedMany(amount, {
      ownerId: this.ownerId,
      jobId: this.jobId,
      boardId: this.boardId,
    });
  }
}
