import express from 'express';
import Logger from './logger';
import config from './config';

const startServer = async () => {
  const app = express();
  const loaders = await import('./loaders');
  await loaders.default(app);

  app.listen(config.port, (err) => {
    if (err) {
      Logger.error(err);
      process.exit(1);
    }
    Logger.info(`
      ################################################
      #  Server listening on port: ${config.port}    
      ################################################
    `);
  });
};

startServer();
