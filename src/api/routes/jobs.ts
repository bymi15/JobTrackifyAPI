import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import JobService from '../services/JobService';
import { Logger } from 'winston';
import { Job } from '../entities/Job';
import { attachUser, checkRole, isAuth } from '../middlewares';
import { ObjectID } from 'typeorm';
import { User } from '../entities/User';
import BoardService from '../services/BoardService';

const route = Router();

route.get('/', isAuth, checkRole('admin'), async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /jobs endpoint');
  try {
    const jobServiceInstance = Container.get(JobService);
    const jobs = await jobServiceInstance.find();
    return res.status(200).json(jobs);
  } catch (e) {
    return next(e);
  }
});

route.get('/user', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /jobs/user endpoint');
  try {
    const jobServiceInstance = Container.get(JobService);
    const jobs = await jobServiceInstance.findByOwner(req.currentUser.id);
    return res.status(200).json(jobs);
  } catch (e) {
    return next(e);
  }
});

route.get('/board/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /jobs/board/:id endpoint');
  try {
    const jobServiceInstance = Container.get(JobService);
    const boardServiceInstance = Container.get(BoardService);
    const board = await boardServiceInstance.getRepo().findOne(req.params.id);
    if (!board) return res.sendStatus(500);
    if (
      req.currentUser.role === 'user' &&
      !(board.owner as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    const jobs = await jobServiceInstance.findByBoard(req.params.id);
    return res.status(200).json(jobs);
  } catch (e) {
    return next(e);
  }
});

route.get('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /jobs/:id endpoint with id: %s', req.params.id);
  try {
    const jobServiceInstance = Container.get(JobService);
    const job = await jobServiceInstance.findOne(req.params.id);
    const jobOwner = job.owner as User;
    if (
      req.currentUser.role !== 'admin' &&
      !jobOwner.id.equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    return res.status(200).json(job);
  } catch (e) {
    return next(e);
  }
});

route.delete('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /jobs/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const jobServiceInstance = Container.get(JobService);
    const job = await jobServiceInstance.getRepo().findOne(req.params.id);
    if (!job) return res.sendStatus(500);
    if (
      req.currentUser.role !== 'admin' &&
      !(job.owner as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    await jobServiceInstance.delete(req.params.id);
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
      company: Joi.string().required(),
      board: Joi.string().required(),
      boardColumn: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string(),
      postUrl: Joi.string(),
      location: Joi.string(),
      dateApplied: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling POST to /jobs/:id endpoint with body: %o', req.body);
    try {
      const jobServiceInstance = Container.get(JobService);
      req.body.owner = req.currentUser.id;
      const job = await jobServiceInstance.create(new Job(req.body));
      return res.status(201).json(job);
    } catch (e) {
      return next(e);
    }
  }
);

route.patch(
  '/:id',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      company: Joi.string(),
      title: Joi.string(),
      description: Joi.string(),
      postUrl: Joi.string(),
      location: Joi.string(),
      dateApplied: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling PATCH to /jobs/:id endpoint with body: %o', req.body);
    try {
      const jobServiceInstance = Container.get(JobService);
      const job = await jobServiceInstance.getRepo().findOne(req.params.id);
      if (!job) return res.sendStatus(500);
      if (
        req.currentUser.role !== 'admin' &&
        !(job.owner as ObjectID).equals(req.currentUser.id)
      ) {
        return res.sendStatus(403);
      }
      const updatedJob = await jobServiceInstance.update(
        req.params.id,
        req.body
      );
      return res.status(200).json(updatedJob);
    } catch (e) {
      return next(e);
    }
  }
);

route.patch(
  '/:id/move',
  isAuth,
  attachUser,
  celebrate({
    body: Joi.object({
      boardColumn: Joi.string().required(),
      prevJobId: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug(
      'Calling PATCH to /jobs/:id/move endpoint with body: %o',
      req.body
    );
    try {
      const jobServiceInstance = Container.get(JobService);
      const job = await jobServiceInstance.getRepo().findOne(req.params.id);
      if (!job) return res.sendStatus(500);
      if (
        req.currentUser.role !== 'admin' &&
        !(job.owner as ObjectID).equals(req.currentUser.id)
      ) {
        return res.sendStatus(403);
      }
      const updatedJob = await jobServiceInstance.move(
        req.params.id,
        req.body.boardColumn,
        req.body.prevJobId
      );
      return res.status(200).json(updatedJob);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
