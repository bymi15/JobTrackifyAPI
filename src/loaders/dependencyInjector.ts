import { Container } from 'typedi';
import Logger from '../logger';

export default (): void => {
  try {
    Container.set('logger', Logger);
  } catch (e) {
    Logger.error('Error on dependency injector loader: %o', e);
    throw e;
  }
};
