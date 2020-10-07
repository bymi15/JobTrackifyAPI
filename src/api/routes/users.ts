import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import { isAuth, attachUser, checkRole } from '../middlewares';
import UserService from '../services/UserService';

const route = Router();

route.get(
  '/',
  isAuth,
  checkRole('admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /user endpoint');
    try {
      const userServiceInstance = Container.get(UserService);
      const users = await userServiceInstance.find();
      return res.json(users).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

route.get('/current', isAuth, attachUser, (req: Request, res: Response) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /user/current endpoint');
  return res.json(req.currentUser).status(200);
});

route.get(
  '/:id',
  isAuth,
  checkRole('staff'),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /user/:id endpoint');
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
