import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import BoardService from '../services/BoardService';
import { Logger } from 'winston';
import { Board } from '../entities/Board';
import { attachUser, checkRole, isAuth } from '../middlewares';
import { User } from '../entities/User';
import { ObjectID } from 'typeorm';

const route = Router();

route.get(
  '/',
  isAuth,
  attachUser,
  checkRole('admin'),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /boards endpoint');
    try {
      const boardServiceInstance = Container.get(BoardService);
      const boards = await boardServiceInstance.find();
      return res.status(200).json(boards);
    } catch (e) {
      return next(e);
    }
  }
);

route.get('/user', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /boards/user endpoint');
  try {
    const boardServiceInstance = Container.get(BoardService);
    const boards = await boardServiceInstance.findByOwner(req.currentUser.id);
    return res.status(200).json(boards);
  } catch (e) {
    return next(e);
  }
});

route.get('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling GET to /boards/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const boardServiceInstance = Container.get(BoardService);
    const board = await boardServiceInstance.findOne(req.params.id);
    if (
      req.currentUser.role !== 'admin' &&
      !(board.owner as User).id.equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    return res.status(200).json(board);
  } catch (e) {
    return next(e);
  }
});

route.delete('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /boards/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const boardServiceInstance = Container.get(BoardService);
    const boardOwner = (await boardServiceInstance.findOne(req.params.id))
      .owner as User;
    if (
      req.currentUser.role !== 'admin' &&
      !boardOwner.id.equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    await boardServiceInstance.delete(req.params.id);
    return res.status(204).end();
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
    logger.debug(
      'Calling POST to /boards/:id endpoint with body: %o',
      req.body
    );
    try {
      const boardServiceInstance = Container.get(BoardService);
      req.body.owner = req.currentUser.id;
      const board = await boardServiceInstance.create(new Board(req.body));
      return res.status(201).json(board);
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
    logger.debug('Calling PUT to /boards/:id endpoint with body: %o', req.body);
    try {
      const boardServiceInstance = Container.get(BoardService);
      const board = await boardServiceInstance.getRepo().findOne(req.params.id);
      if (!board) return res.sendStatus(500);
      if (
        req.currentUser.role !== 'admin' &&
        !(board.owner as ObjectID).equals(req.currentUser.id)
      ) {
        return res.sendStatus(403);
      }
      const updatedBoard = await boardServiceInstance.update(
        req.params.id,
        req.body
      );
      return res.status(200).json(updatedBoard);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
