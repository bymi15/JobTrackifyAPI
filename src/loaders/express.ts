import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { Application, NextFunction, Request, Response } from 'express';
import apiRoutes from '../api/routes';
import Logger from '../logger';
import { ValidationError } from 'class-validator';

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

  // Load API routes
  app.use('/api', apiRoutes);

  /// Error handlers
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Array && err[0] instanceof ValidationError) {
      const messageArr: Array<string> = [];
      let e: ValidationError;
      for (e of err) {
        Object.values(e.constraints).map((msg: string) => {
          messageArr.push(msg);
        });
      }
      Logger.error('Error: %o', messageArr);
      res.status(400).json({ errors: messageArr }).end();
    } else {
      next(err);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    Logger.error('Error: %o', err.message);
    if (err.name === 'UnauthorizedError') {
      /**
       * Handle 401 thrown by express-jwt library
       */
      return res.status(401).json({ error: err.message });
    } else {
      return res.status(500).json({
        error: err.message,
      });
    }
  });
};
