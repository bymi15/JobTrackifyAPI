import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import BoardService from '../services/BoardService';
import { Logger } from 'winston';
import { Board } from '../entities/Board';
import { attachUser, isAuth } from '../middlewares';
import { User } from '../entities/User';

const route = Router();

route.get('/', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /board endpoint');
  try {
    const boardServiceInstance = Container.get(BoardService);
    const boards = await boardServiceInstance.findByOwner(req.currentUser.id);
    return res.json(boards).status(200);
  } catch (e) {
    return next(e);
  }
});

route.get('/:id', isAuth, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /board/:id endpoint with id: %s', req.params.id);
  try {
    const boardServiceInstance = Container.get(BoardService);
    const board = await boardServiceInstance.findOne(req.params.id);
    if (board.owner !== req.currentUser.id) return res.sendStatus(403);
    return res.json(board).status(200);
  } catch (e) {
    return next(e);
  }
});

route.delete('/:id', isAuth, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /board/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const boardServiceInstance = Container.get(BoardService);
    const boardUser = (await boardServiceInstance.findOne(req.params.id))
      .owner as User;
    if (!boardUser.id.equals(req.currentUser.id)) return res.sendStatus(403);
    await boardServiceInstance.delete(req.params.id);
    return res.json({}).status(204);
  } catch (e) {
    return next(e);
  }
});

route.post(
  '/',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      title: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling POST to /board/:id endpoint with body: %o', req.body);
    try {
      const boardServiceInstance = Container.get(BoardService);
      req.body.owner = req.currentUser.id;
      const board = await boardServiceInstance.create(new Board(req.body));
      return res.json(board).status(201);
    } catch (e) {
      return next(e);
    }
  }
);

route.put(
  '/:id',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      title: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling PUT to /board/:id endpoint with body: %o', req.body);
    try {
      const boardServiceInstance = Container.get(BoardService);
      const boardUser = (await boardServiceInstance.findOne(req.params.id))
        .owner as User;
      if (!boardUser.id.equals(req.currentUser.id)) return res.sendStatus(403);
      req.body.owner = req.currentUser.id;

      const updatedBoard = await boardServiceInstance.update(
        req.params.id,
        new Board(req.body)
      );
      return res.json(updatedBoard).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
