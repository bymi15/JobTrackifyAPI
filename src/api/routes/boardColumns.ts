import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import BoardColumnService from '../services/BoardColumnService';
import { Logger } from 'winston';
import { BoardColumn } from '../entities/BoardColumn';
import { checkRole, isAuth } from '../middlewares';

const route = Router();

route.get('/', isAuth, async (_req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /boardColumns endpoint');
  try {
    const boardColumnServiceInstance = Container.get(BoardColumnService);
    const boardColumns = await boardColumnServiceInstance.find();
    return res.status(200).json(boardColumns);
  } catch (e) {
    return next(e);
  }
});

route.get('/:id', isAuth, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling GET to /boardColumns/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const boardColumnServiceInstance = Container.get(BoardColumnService);
    const boardColumn = await boardColumnServiceInstance.findOne(req.params.id);
    return res.status(200).json(boardColumn);
  } catch (e) {
    return next(e);
  }
});

route.delete('/:id', isAuth, checkRole('admin'), async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /boardColumns/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const boardColumnServiceInstance = Container.get(BoardColumnService);
    await boardColumnServiceInstance.delete(req.params.id);
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
});

route.post(
  '/',
  isAuth,
  checkRole('admin'),
  celebrate({
    body: Joi.object({
      title: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug(
      'Calling POST to /boardColumns/:id endpoint with body: %o',
      req.body
    );
    try {
      const boardColumnServiceInstance = Container.get(BoardColumnService);
      const boardColumn = await boardColumnServiceInstance.create(
        new BoardColumn(req.body)
      );
      return res.status(201).json(boardColumn);
    } catch (e) {
      return next(e);
    }
  }
);

route.patch(
  '/:id',
  isAuth,
  checkRole('admin'),
  celebrate({
    body: Joi.object({
      title: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug(
      'Calling PATCH to /boardColumns/:id endpoint with body: %o',
      req.body
    );
    try {
      const boardColumnServiceInstance = Container.get(BoardColumnService);
      const boardColumn = await boardColumnServiceInstance.update(
        req.params.id,
        req.body
      );
      return res.status(200).json(boardColumn);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
