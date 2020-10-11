/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from 'typedi';
import { MongoRepository } from 'typeorm';
import { Logger } from 'winston';
import { validate } from 'class-validator';
import { ErrorHandler } from '../../helpers/ErrorHandler';

@Service()
export default class CRUD<Entity> {
  protected repo: MongoRepository<Entity>;
  protected logger: Logger;

  constructor(repo: MongoRepository<Entity>, logger: Logger) {
    this.repo = repo;
    this.logger = logger;
  }

  getRepo(): MongoRepository<Entity> {
    return this.repo;
  }

  protected async fillObjectIdField(
    entity: Entity,
    fieldName: string,
    fieldEntityService: CRUD<any>
  ): Promise<void> {
    const entityName = entity.constructor.name;
    if (!entity) throw new ErrorHandler(500, `${entityName} not found`);
    if (!(fieldName in entity))
      throw new ErrorHandler(
        500,
        `${fieldName} does not exist in ${entityName}`
      );
    entity[fieldName] = await fieldEntityService.findOne(entity[fieldName]);
    if (!entity[fieldName]) {
      throw new ErrorHandler(500, `Invalid ${fieldName}`);
    }
  }

  async create(entity: Entity, identifier?: string): Promise<Entity> {
    const errors = await validate(entity, {
      validationError: { target: false },
    });
    const foundEntity =
      identifier &&
      (await this.repo.findOne({
        [identifier]: entity[identifier],
      }));
    if (foundEntity)
      throw new ErrorHandler(
        400,
        `The ${entity.constructor.name} already exists`
      );

    if (errors.length > 0) throw errors;
    return await this.repo.save(entity);
  }

  async find(): Promise<Entity[]> {
    const entities = await this.repo.find();
    if (entities) {
      return entities;
    }
    throw new ErrorHandler(404, 'Not found');
  }

  async findOne(id: string): Promise<Entity | undefined> {
    const entity = await this.repo.findOne(id);
    if (entity) {
      return entity;
    }
    throw new ErrorHandler(404, 'Not found');
  }

  async update(id: string, newEntity: Entity): Promise<Entity> {
    const entity = await this.repo.findOne(id);
    if (!entity) throw new ErrorHandler(500, 'The id is invalid');
    Object.keys(newEntity).forEach((key) => {
      if (newEntity[key]) {
        entity[key] = newEntity[key];
      }
    });
    const errors = await validate(entity, {
      validationError: { target: false },
    });
    if (errors.length > 0) throw errors;
    return this.repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
