import expressLoader from './express';
import mongodbLoader from './mongodb';
import Logger from '../logger';
import dependencyInjector from './dependencyInjector';

export default async (app) => {
  dependencyInjector();
  Logger.info('Dependency injector loaded!');

  await mongodbLoader();
  Logger.info('MongoDB loaded and connected!');

  await expressLoader(app);
  Logger.info('Express loaded!');
};
