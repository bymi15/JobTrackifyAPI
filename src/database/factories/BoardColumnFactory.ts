import { BoardColumn } from '../../api/entities/BoardColumn';
import * as faker from 'faker';

export default (data?: BoardColumn): BoardColumn => {
  const boardColumn = new BoardColumn({
    title: (data && data.title) || faker.random.word(),
  });
  return boardColumn;
};
