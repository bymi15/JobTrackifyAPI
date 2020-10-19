import { Job } from '../../api/entities/Job';
import * as faker from 'faker';
import { ObjectID as mongoObjectID } from 'mongodb';
import { ObjectID } from 'typeorm';

export default (data?: Job): Job => {
  const job = new Job({
    company: (data && data.company) || (new mongoObjectID() as ObjectID),
    board: (data && data.board) || (new mongoObjectID() as ObjectID),
    boardColumn:
      (data && data.boardColumn) || (new mongoObjectID() as ObjectID),
    title: (data && data.title) || faker.name.jobTitle(),
    description: (data && data.description) || faker.name.jobDescriptor(),
    postUrl: (data && data.postUrl) || faker.internet.url(),
    location:
      (data && data.location) ||
      `${faker.address.city()}, ${faker.address.country()}`,
    index: (data && data.index) || faker.random.number(),
    sortOrder: (data && data.sortOrder) || faker.random.number(),
    dateApplied: (data && data.dateApplied) || faker.date.past().toUTCString(),
    owner: (data && data.owner) || (new mongoObjectID() as ObjectID),
  });
  return job;
};
