import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import { isAuth, checkRole, attachUser } from '../middlewares';
import UserService from '../services/UserService';
import { celebrate, Joi } from 'celebrate';

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

route.delete('/:id', isAuth, checkRole('admin'), async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /users/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const userServiceInstance = Container.get(UserService);
    await userServiceInstance.delete(req.params.id);
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
});

route.patch(
  '/:id',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug(
      'Calling PATCH to /users/:id endpoint with body: %o',
      req.body
    );
    try {
      const userServiceInstance = Container.get(UserService);
      if (
        req.currentUser.role !== 'admin' &&
        req.params.id !== req.currentUser.id.toHexString()
      ) {
        return res.sendStatus(403);
      }
      const updatedUser = await userServiceInstance.update(
        req.currentUser.id.toHexString(),
        req.body
      );
      return res.status(200).json(updatedUser);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
