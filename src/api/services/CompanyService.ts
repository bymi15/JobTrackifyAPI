import { Inject, Service } from 'typedi';
import { Company } from '../entities/Company';
import { Like, MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import { ErrorHandler } from '../../helpers/ErrorHandler';

@Service()
export default class CompanyService extends CRUD<Company> {
  constructor(
    @InjectRepository(Company)
    protected repo: MongoRepository<Company>,
    @Inject('logger')
    protected logger: Logger
  ) {
    super(repo, logger);
  }

  async create(company: Company): Promise<Company> {
    return await super.create(company, 'name');
  }

  async find(): Promise<Company[]> {
    return await super.find({ order: { name: 'ASC' } });
  }

  async search(query: string): Promise<Company[]> {
    if (query.trim() === '') {
      throw new ErrorHandler(400, 'Query is empty');
    }
    return await super.find({
      where: {
        name: { $regex: `^${query}.*$`, $options: 'i' },
      },
      take: 5,
    });
  }
}
