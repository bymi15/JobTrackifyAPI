import { Note } from '../../api/entities/Note';
import { ObjectID as mongoObjectID } from 'mongodb';
import { ObjectID } from 'typeorm';
import * as faker from 'faker';

export default (data?: Note): Note => {
  const note = new Note({
    body: (data && data.body) || faker.random.word(),
    ownerId: (data && data.ownerId) || (new mongoObjectID() as ObjectID),
    jobId: (data && data.jobId) || (new mongoObjectID() as ObjectID),
    boardId: (data && data.boardId) || (new mongoObjectID() as ObjectID),
    createdAt: (data && data.createdAt) || faker.random.word(),
    updatedAt: (data && data.updatedAt) || faker.random.word(),
  });
  return note;
};
