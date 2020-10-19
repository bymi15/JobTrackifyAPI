import { Inject, Service } from 'typedi';
import { BoardColumn } from '../entities/BoardColumn';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';

@Service()
export default class BoardColumnService extends CRUD<BoardColumn> {
  constructor(
    @InjectRepository(BoardColumn)
    protected repo: MongoRepository<BoardColumn>,
    @Inject('logger')
    protected logger: Logger
  ) {
    super(repo, logger);
  }

  async create(boardColumn: BoardColumn): Promise<BoardColumn> {
    const res = await super.create(boardColumn, 'title');
    Reflect.deleteProperty(res, 'createdAt');
    return res;
  }

  async find(): Promise<BoardColumn[]> {
    const res = await super.find({ order: { createdAt: 'ASC' } });
    Reflect.deleteProperty(res, 'createdAt');
    return res;
  }

  async findOne(id: string): Promise<BoardColumn> {
    const res = await super.findOne(id);
    Reflect.deleteProperty(res, 'createdAt');
    return res;
  }
}
