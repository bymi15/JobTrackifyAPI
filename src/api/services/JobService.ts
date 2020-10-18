import Container, { Inject, Service } from 'typedi';
import { Job } from '../entities/Job';
import { MongoRepository, ObjectID, ObjectLiteral } from 'typeorm';
import { ObjectID as mongoObjectId } from 'mongodb';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import UserService from './UserService';
import CompanyService from './CompanyService';
import BoardService from './BoardService';
import BoardColumnService from './BoardColumnService';
import { ErrorHandler } from '../../helpers/ErrorHandler';

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

  private async fillAllObjects(job: Job): Promise<void> {
    await super.fillObjectIdField(
      job,
      'company',
      Container.get(CompanyService)
    );
    await super.fillObjectIdField(job, 'board', Container.get(BoardService));
    await super.fillObjectIdField(
      job,
      'boardColumn',
      Container.get(BoardColumnService)
    );
    await super.fillObjectIdField(job, 'owner', Container.get(UserService));
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
    job.index = count + 1;
    job.sortOrder = job.index * 1000;
    const savedJob = await super.create(job);
    await this.fillAllObjects(savedJob);
    return savedJob;
  }

  async findByOwner(owner: ObjectID): Promise<Job[]> {
    const jobs: Job[] = await super.find({
      where: {
        owner: { $eq: owner },
      },
      order: { sortOrder: 'ASC' },
    });
    for (const job of jobs) {
      Reflect.deleteProperty(job, 'owner');
    }
    return jobs;
  }

  async findByBoard(board: string): Promise<Job[]> {
    const jobs: Job[] = await super.find({
      where: {
        board: { $eq: board },
      },
      order: { sortOrder: 'ASC' },
    });
    for (const job of jobs) {
      Reflect.deleteProperty(job, 'owner');
      Reflect.deleteProperty(job, 'board');
    }
    return jobs;
  }

  async find(): Promise<Job[]> {
    const jobs: Job[] = await super.find({ order: { sortOrder: 'ASC' } });
    for (const job of jobs) {
      await this.fillAllObjects(job);
    }
    return jobs;
  }

  async findOne(id: string): Promise<Job | undefined> {
    const job = await super.findOne(id);
    await this.fillAllObjects(job);
    return job;
  }

  async update(id: string, updatedFields: ObjectLiteral): Promise<Job> {
    const updatedJob = await super.update(id, updatedFields);
    await this.fillAllObjects(updatedJob);
    return updatedJob;
  }

  async move(id: string, boardColumn: string, prevJobId?: string) {
    const currentJob = await super.findOne(id);
    const prevJob = prevJobId && (await super.findOne(prevJobId));
    const minSortOrder = (prevJob && prevJob.sortOrder) || 0;
    const temp = await super.find({
      where: {
        $and: [
          { sortOrder: { $gt: minSortOrder } },
          { id: { $not: { $eq: currentJob.id } } },
        ],
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
      await this.move(id, boardColumn, prevJobId);
    } else {
      return await this.update(id, {
        sortOrder: newSortOrder,
        boardColumn: boardColumn,
      });
    }
  }
}
