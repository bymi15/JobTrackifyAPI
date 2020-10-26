import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import { isAuth, checkRole } from '../middlewares';
import UserService from '../services/UserService';

const route = Router();

route.get(
  '/',
  isAuth,
  checkRole('admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /users endpoint');
    try {
      const userServiceInstance = Container.get(UserService);
      const users = await userServiceInstance.find();
      return res.json(users).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

route.get(
  '/:id',
  isAuth,
  checkRole('staff'),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /users/:id endpoint');
    try {
      const userServiceInstance = Container.get(UserService);
      const user = await userServiceInstance.findOne(req.params.id);
      return res.json(user).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
