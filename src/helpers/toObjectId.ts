// https://eliezer.medium.com/typeorm-mongodb-review-8855903228b1
import { ObjectID as mongoObjectId } from 'mongodb';
import { ObjectID } from 'typeorm';
export const toObjectId = (value: string | ObjectID): ObjectID =>
  typeof value === 'string' ? (new mongoObjectId(value) as ObjectID) : value;
