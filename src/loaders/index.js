import expressLoader from './express';
import mongodbLoader from './mongodb';
import Logger from './logger';

export default async (app) => {
  await mongodbLoader();
  Logger.info('MongoDB loaded and connected!');

  await expressLoader(app);
  Logger.info('Express loaded!');
};
