import expressLoader from './express';
import databaseLoader from './database';
import Logger from '../logger';
import dependencyInjector from './dependencyInjector';
import { Application } from 'express';

export default async (app: Application): Promise<void> => {
  dependencyInjector();
  Logger.info('Dependency injector loaded!');

  await databaseLoader();
  Logger.info('Database loaded and connected!');

  expressLoader(app);
  Logger.info('Express loaded!');
};
