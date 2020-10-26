import Container, { Inject, Service } from 'typedi';
import { ObjectId as mongoObjectID } from 'mongodb';
import { Job } from '../entities/Job';
import { MongoRepository, ObjectID, ObjectLiteral } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import CompanyService from './CompanyService';
import BoardService from './BoardService';
import BoardColumnService from './BoardColumnService';

@Service()
export default class JobService extends CRUD<Job> {
  constructor(
    @InjectRepository(Job)
    protected repo: MongoRepository<Job>,
    @Inject('logger')
    protected logger: Logger
  ) {
    super(repo, logger);
  }

  private async fillCompanyField(job: Job): Promise<void> {
    await super.fillObjectIdField(
      job,
      'company',
      Container.get(CompanyService)
    );
  }
  private async fillBoardField(job: Job): Promise<void> {
    await super.fillObjectIdField(job, 'board', Container.get(BoardService));
  }
  private async fillBoardColumnField(job: Job): Promise<void> {
    await super.fillObjectIdField(
      job,
      'boardColumn',
      Container.get(BoardColumnService)
    );
  }

  private async alignSortOrder(): Promise<void> {
    const jobs: Job[] = await super.find({ order: { sortOrder: 'ASC' } });
    for (let i = 0; i < jobs.length; i++) {
      const defaultSortOrder = (i + 1) * 1000;
      if (jobs[i].sortOrder !== defaultSortOrder) {
        await super.update(jobs[i].id.toHexString(), {
          sortOrder: defaultSortOrder,
        });
      }
    }
  }

  async create(job: Job): Promise<Job> {
    const count = await super.count({
      board: job.board,
      boardColumn: job.boardColumn,
    });
    job.sortOrder = (count + 1) * 1000;
    const savedJob = await super.create(job);
    await this.fillCompanyField(savedJob);
    await this.fillBoardColumnField(savedJob);
    Reflect.deleteProperty(savedJob, 'owner');
    return savedJob;
  }

  async findByOwner(owner: string | ObjectID): Promise<Job[]> {
    if (typeof owner === 'string') {
      owner = new mongoObjectID(owner) as ObjectID;
    }
    const jobs: Job[] = await super.find({
      where: {
        owner: { $eq: owner },
      },
      order: { sortOrder: 'ASC' },
    });
    for (const job of jobs) {
      await this.fillCompanyField(job);
      await this.fillBoardField(job);
      await this.fillBoardColumnField(job);
      Reflect.deleteProperty(job, 'owner');
    }
    return jobs;
  }

  async findByBoard(board: string | ObjectID): Promise<Job[]> {
    if (typeof board === 'string') {
      board = new mongoObjectID(board) as ObjectID;
    }
    const jobs: Job[] = await super.find({
      where: {
        board: { $eq: board },
      },
      order: { boardColumn: 'ASC', sortOrder: 'ASC' },
    });
    for (const job of jobs) {
      Reflect.deleteProperty(job, 'owner');
      Reflect.deleteProperty(job, 'board');
      await this.fillCompanyField(job);
      await this.fillBoardColumnField(job);
    }
    return jobs;
  }

  async findByBoardAndColumn(
    board: string | ObjectID,
    boardColumn: string | ObjectID
  ): Promise<Job[]> {
    if (typeof board === 'string') {
      board = new mongoObjectID(board) as ObjectID;
    }
    if (typeof boardColumn === 'string') {
      boardColumn = new mongoObjectID(boardColumn) as ObjectID;
    }
    const jobs: Job[] = await super.find({
      where: {
        board: { $eq: board },
        boardColumn: { $eq: boardColumn },
      },
      order: { sortOrder: 'ASC' },
    });
    for (const job of jobs) {
      Reflect.deleteProperty(job, 'owner');
      Reflect.deleteProperty(job, 'board');
      Reflect.deleteProperty(job, 'boardColumn');
      await this.fillCompanyField(job);
    }
    return jobs;
  }

  async find(): Promise<Job[]> {
    const jobs: Job[] = await super.find({ order: { sortOrder: 'ASC' } });
    for (const job of jobs) {
      await this.fillCompanyField(job);
      await this.fillBoardField(job);
      await this.fillBoardColumnField(job);
      Reflect.deleteProperty(job, 'owner');
    }
    return jobs;
  }

  async findOne(id: string): Promise<Job | undefined> {
    const job = await super.findOne(id);
    await this.fillCompanyField(job);
    await this.fillBoardField(job);
    await this.fillBoardColumnField(job);
    Reflect.deleteProperty(job, 'owner');
    return job;
  }

  async update(id: string, updatedFields: ObjectLiteral): Promise<Job> {
    const updatedJob = await super.update(id, updatedFields);
    await this.fillCompanyField(updatedJob);
    await this.fillBoardColumnField(updatedJob);
    Reflect.deleteProperty(updatedJob, 'owner');
    return updatedJob;
  }

  async move(id: string, boardColumn: string, prevJobId?: string) {
    const jobId = new mongoObjectID(id) as ObjectID;
    const prevJob = prevJobId && (await super.findOne(prevJobId));
    const minSortOrder = (prevJob && prevJob.sortOrder) || 0;
    const temp = await super.find({
      where: {
        sortOrder: { $gt: minSortOrder },
        id: { $not: { $eq: jobId } },
      },
      order: {
        sortOrder: 'ASC',
      },
      take: 1,
    });
    const nextJob = temp.length > 0 ? temp[0] : null;
    const maxSortOrder = nextJob
      ? nextJob.sortOrder
      : Math.ceil((minSortOrder + 1) / 1000) * 1000;
    const newSortOrder = Math.floor((minSortOrder + maxSortOrder) / 2);
    // Can no longer divide sort order in half - need to reset sortOrder to current index * 1000
    if (newSortOrder === minSortOrder || newSortOrder === maxSortOrder) {
      await this.alignSortOrder();
      return await this.move(id, boardColumn, prevJobId);
    } else {
      return await this.update(id, {
        sortOrder: newSortOrder,
        boardColumn: new mongoObjectID(boardColumn) as ObjectID,
      });
    }
  }
}
