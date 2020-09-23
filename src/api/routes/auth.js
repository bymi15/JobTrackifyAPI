import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import AuthService from '../../services/auth';
import Logger from '../../loaders/logger';

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
      Logger.debug('Calling /register endpoint with body: %o', req.body);
      try {
        const { user, token } = await AuthService.register(req.body);
        return res.status(201).json({ user, token });
      } catch (e) {
        Logger.error('Error: %o', e);
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
      Logger.debug('Calling /login endpoint with body: %o', req.body);
      try {
        const { user, token } = await AuthService.login(
          req.body.email,
          req.body.password
        );
        return res.json({ user, token }).status(200);
      } catch (e) {
        Logger.error('Error: %o', e);
        return next(e);
      }
    }
  );
};
