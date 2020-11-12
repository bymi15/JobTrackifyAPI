import Container, { Inject, Service } from 'typedi';
import { Job } from '../entities/Job';
import { MongoRepository, ObjectID, ObjectLiteral } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import CompanyService from './CompanyService';
import BoardService from './BoardService';
import BoardColumnService from './BoardColumnService';
import { ErrorHandler } from '../../helpers/ErrorHandler';
import _ from 'lodash';
import NodeGeocoder, { GoogleOptions } from 'node-geocoder';
import config from '../../config';
import { toObjectId } from '../../helpers/toObjectId';

const options: GoogleOptions = {
  provider: 'google',
  apiKey: config.googleApiKey,
};

const geocoder = NodeGeocoder(options);

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
    if (typeof job.company !== 'string') {
      await super.fillObjectIdField(
        job,
        'company',
        Container.get(CompanyService)
      );
    }
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

  // Reset the sortOrder of the jobs in the same board and column
  // to the default values of (index+1)*1000
  private async alignSortOrder(
    board: string,
    boardColumn: string
  ): Promise<void> {
    const jobs: Job[] = await super.find({
      where: {
        board: { $eq: toObjectId(board) },
        boardColumn: { $eq: toObjectId(boardColumn) as ObjectID },
      },
      order: { sortOrder: 'ASC' },
    });
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
    const boardService = Container.get(BoardService);
    const board = await boardService.getRepo().findOne(job.board);
    if (!(job.owner as ObjectID).equals(board.owner as ObjectID)) {
      throw new ErrorHandler(
        500,
        'Job owner cannot be different to board owner'
      );
    }
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
    owner = toObjectId(owner);
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
    board = toObjectId(board);
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
    board = toObjectId(board);
    boardColumn = toObjectId(boardColumn);
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
    }
    return jobs;
  }

  async findOne(id: string): Promise<Job | undefined> {
    const job = await super.findOne(id);
    await this.fillCompanyField(job);
    await this.fillBoardField(job);
    await this.fillBoardColumnField(job);
    return job;
  }

  async update(id: string, updatedFields: ObjectLiteral): Promise<Job> {
    if (_.has(updatedFields, 'location')) {
      if (
        updatedFields.location.address &&
        updatedFields.location.address.trim()
      ) {
        let geocodeData = await geocoder.geocode(
          updatedFields.location.address
        );
        if (!geocodeData || geocodeData.length === 0) {
          geocodeData = [{ latitude: 0, longitude: 0 }];
        }
        updatedFields.location.lat = geocodeData[0].latitude;
        updatedFields.location.lng = geocodeData[0].longitude;
      } else {
        updatedFields.location = undefined;
      }
    }
    const updatedJob = await super.update(id, updatedFields);
    await this.fillCompanyField(updatedJob);
    await this.fillBoardColumnField(updatedJob);
    Reflect.deleteProperty(updatedJob, 'owner');
    return updatedJob;
  }

  async move(
    id: string,
    board: string,
    boardColumn: string,
    prevJobId?: string,
    retry?: boolean
  ) {
    const jobId = toObjectId(id);
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
      // Already tried to align sort order but failed - critical error
      if (retry) {
        throw new ErrorHandler(500, 'Sort order alignment failed');
      }
      await this.alignSortOrder(board, boardColumn);
      return await this.move(id, board, boardColumn, prevJobId, true);
    } else {
      return await this.update(id, {
        sortOrder: newSortOrder,
        boardColumn: toObjectId(boardColumn),
      });
    }
  }
}
