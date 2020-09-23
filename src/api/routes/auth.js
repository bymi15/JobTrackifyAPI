import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import AuthService from '../../services/auth';

const route = Router();

export default (app) => {
  app.use('/auth', route);

  route.post(
    '/register',
    celebrate({
      body: Joi.object({
        fullName: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Calling /register endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.register(req.body);
        return res.status(201).json({ user, token });
      } catch (e) {
        logger.error('Error: %o', e);
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
      const logger = Container.get('logger');
      logger.debug('Calling /login endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.login(
          req.body.email,
          req.body.password
        );
        return res.json({ user, token }).status(200);
      } catch (e) {
        logger.error('Error: %o', e);
        return next(e);
      }
    }
  );
};
