import { MongoRepository, ObjectID } from 'typeorm';
import EntitySeed from './EntitySeed';
import { Job } from '../../api/entities/Job';
import JobFactory from '../factories/JobFactory';

export default class JobSeed {
  private jobSeed: EntitySeed<Job>;
  private company: ObjectID;
  private board: ObjectID;
  private boardColumn: ObjectID;
  private owner: ObjectID;

  constructor(
    repo: MongoRepository<Job>,
    company: ObjectID,
    board: ObjectID,
    boardColumn: ObjectID,
    owner: ObjectID
  ) {
    this.jobSeed = new EntitySeed<Job>(repo, JobFactory);
    this.company = company;
    this.board = board;
    this.boardColumn = boardColumn;
    this.owner = owner;
  }

  public async seedOne(data?: Job): Promise<Job> {
    data = data || new Job();
    data.company = this.company;
    data.board = this.board;
    data.boardColumn = this.boardColumn;
    data.owner = this.owner;
    return await this.jobSeed.seedOne(data);
  }

  public async seedMany(amount: number): Promise<Job[]> {
    return await this.jobSeed.seedMany(amount, {
      company: this.company,
      board: this.board,
      boardColumn: this.boardColumn,
      owner: this.owner,
    });
  }
}
