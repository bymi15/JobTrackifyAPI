import { Container } from 'typedi';
import Logger from '../logger';
import User from '../models/user';

export default () => {
  try {
    Container.set('userModel', User);
    Container.set('logger', Logger);
  } catch (e) {
    Logger.error('Error on dependency injector loader: %o', e);
    throw e;
  }
};
