import { Board } from '../../api/entities/Board';
import * as faker from 'faker';
import { ObjectID as mongoObjectID } from 'mongodb';
import { ObjectID } from 'typeorm';

export default (data?: Board): Board => {
  const board = new Board({
    title: (data && data.title) || faker.random.word(),
    owner: (data && data.owner) || (new mongoObjectID() as ObjectID),
  });
  return board;
};
