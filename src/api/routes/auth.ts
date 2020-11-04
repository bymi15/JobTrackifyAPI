import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import UserService from '../services/UserService';
import { Logger } from 'winston';
import { attachUser, isAuth } from '../middlewares';

const route = Router();

route.post(
  '/register',
  celebrate({
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling /auth/register endpoint with body: %o', req.body);
    try {
      const userServiceInstance = Container.get(UserService);
      const { user, token } = await userServiceInstance.register(req.body);
      return res.status(201).json({ user, token });
    } catch (e) {
      return next(e);
    }
  }
);

route.post(
  '/login',
  celebrate({
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling /auth/login endpoint with email: %s', req.body.email);
    try {
      const userServiceInstance = Container.get(UserService);
      const { user, token } = await userServiceInstance.login(
        req.body.email,
        req.body.password
      );
      return res.status(200).json({ user, token });
    } catch (e) {
      return next(e);
    }
  }
);

route.get('/user', isAuth, attachUser, (req, res) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /auth/user endpoint');
  return res.status(200).json(req.currentUser);
});

route.get('/logout', isAuth, (_req, res) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /auth/logout endpoint');
  return res.status(204).end();
});

route.put(
  '/changePassword',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      currentPassword: Joi.string(),
      password: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling PUT to /auth/changePassword endpoint', req.body);
    try {
      const userServiceInstance = Container.get(UserService);
      const user = await userServiceInstance.changePassword(
        req.currentUser,
        req.body
      );
      return res.status(200).json(user);
    } catch (e) {
      return next(e);
    }
  }
);

route.delete('/deleteAccount', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling DELETE to /auth/deleteAccount endpoint');
  try {
    const userServiceInstance = Container.get(UserService);
    await userServiceInstance.delete(req.currentUser.id.toHexString());
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
});

route.patch(
  '/profile',
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
      'Calling PATCH to /auth/profile endpoint with body: %o',
      req.body
    );
    try {
      const userServiceInstance = Container.get(UserService);
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
