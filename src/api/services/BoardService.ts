import Container, { Inject, Service } from 'typedi';
import { Board } from '../entities/Board';
import { MongoRepository, ObjectID, ObjectLiteral } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import CRUD from './CRUD';
import UserService from './UserService';

@Service()
export default class BoardService extends CRUD<Board> {
  constructor(
    @InjectRepository(Board)
    protected repo: MongoRepository<Board>,
    @Inject('logger')
    protected logger: Logger
  ) {
    super(repo, logger);
  }

  private async fillOwnerWithUser(board: Board): Promise<void> {
    await super.fillObjectIdField(board, 'owner', Container.get(UserService));
  }

  async create(board: Board): Promise<Board> {
    const savedBoard = await super.create(board);
    await this.fillOwnerWithUser(savedBoard);
    return savedBoard;
  }

  async findByOwner(owner: ObjectID): Promise<Board[]> {
    const boards: Board[] = await this.repo.find({ owner: owner });
    for (const board of boards) {
      Reflect.deleteProperty(board, 'owner');
    }
    return boards;
  }

  async find(): Promise<Board[]> {
    const boards: Board[] = await super.find();
    for (const board of boards) {
      await this.fillOwnerWithUser(board);
    }
    return boards;
  }

  async findOne(id: string): Promise<Board | undefined> {
    const board = await super.findOne(id);
    if (board) {
      await this.fillOwnerWithUser(board);
    }
    return board;
  }

  async update(id: string, updatedFields: ObjectLiteral): Promise<Board> {
    const updatedBoard = await super.update(id, updatedFields);
    if (updatedBoard) {
      await this.fillOwnerWithUser(updatedBoard);
    }
    return updatedBoard;
  }
}
