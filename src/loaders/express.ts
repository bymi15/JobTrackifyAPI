import * as express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { Application, NextFunction, Request, Response } from 'express';
import apiRoutes from '../api/routes';
import Logger from '../logger';
import { ValidationError } from 'class-validator';
import { ErrorHandler, handleError } from '../helpers/ErrorHandler';
import { isCelebrateError } from 'celebrate';

export default (app: Application): void => {
  // Health Check endpoints
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });
  app.enable('trust proxy');
  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());

  // Serve static files from the public folder
  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      maxAge: 31557600000,
    })
  );

  // Load API routes
  app.use('/api', apiRoutes);

  /// Error handlers
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (isCelebrateError(err)) {
      Logger.error('Error: %o', err);
      res.status(400).json({ error: 'Invalid data' }).end();
    } else if (err instanceof Array && err[0] instanceof ValidationError) {
      const messageArr: Array<string> = [];
      let e: ValidationError;
      for (e of err) {
        Object.values(e.constraints).map((msg: string) => {
          messageArr.push(msg);
        });
      }
      Logger.error('Error: %o', messageArr);
      res.status(400).json({ error: messageArr }).end();
    } else if (err.name === 'UnauthorizedError') {
      /**
       * Handle 401 thrown by express-jwt library
       */
      return res.status(401).json({ error: err.message });
    } else {
      next(err);
    }
  });

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: ErrorHandler, _req: Request, res: Response, _next: NextFunction) => {
      Logger.error('Error: %o', err.message);
      handleError(err, res);
    }
  );
};
