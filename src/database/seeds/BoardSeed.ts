import { Board } from '../../api/entities/Board';
import { MongoRepository, ObjectID } from 'typeorm';
import BoardFactory from '../factories/BoardFactory';
import EntitySeed from './EntitySeed';

export default class BoardSeed {
  private boardSeed: EntitySeed<Board>;
  private owner: ObjectID;

  constructor(repo: MongoRepository<Board>, owner: ObjectID) {
    this.boardSeed = new EntitySeed<Board>(repo, BoardFactory);
    this.owner = owner;
  }

  public async seedOne(data?: Board): Promise<Board> {
    data = data || new Board();
    data.owner = this.owner;
    return await this.boardSeed.seedOne(data);
  }

  public async seedMany(amount: number): Promise<Board[]> {
    return await this.boardSeed.seedMany(amount, {
      owner: this.owner,
    });
  }
}
