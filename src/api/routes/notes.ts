import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import NoteService from '../services/NoteService';
import { Logger } from 'winston';
import { Note } from '../entities/Note';
import { attachUser, checkRole, isAuth } from '../middlewares';
import BoardService from '../services/BoardService';
import { ObjectID } from 'typeorm';
import JobService from '../services/JobService';
import { ObjectID as mongoObjectID } from 'mongodb';

const route = Router();

route.get('/', isAuth, checkRole('admin'), async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /notes endpoint');
  try {
    const noteServiceInstance = Container.get(NoteService);
    const notes = await noteServiceInstance.find();
    return res.status(200).json(notes);
  } catch (e) {
    return next(e);
  }
});

route.get('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /notes/:id endpoint with id: %s', req.params.id);
  try {
    const noteServiceInstance = Container.get(NoteService);
    const note = await noteServiceInstance.findOne(req.params.id);
    if (
      req.currentUser.role !== 'admin' &&
      !(note.ownerId as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    return res.status(200).json(note);
  } catch (e) {
    return next(e);
  }
});

route.get('/board/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /notes/board/:id endpoint');
  try {
    const noteServiceInstance = Container.get(NoteService);
    const boardServiceInstance = Container.get(BoardService);
    const board = await boardServiceInstance.getRepo().findOne(req.params.id);
    if (!board) return res.sendStatus(500);
    if (
      req.currentUser.role !== 'admin' &&
      !(board.owner as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    const notes = await noteServiceInstance.findByBoard(board.id);
    return res.status(200).json(notes);
  } catch (e) {
    return next(e);
  }
});

route.get('/job/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling GET to /notes/job/:id endpoint');
  try {
    const noteServiceInstance = Container.get(NoteService);
    const jobServiceInstance = Container.get(JobService);
    const job = await jobServiceInstance.getRepo().findOne(req.params.id);
    if (!job) return res.sendStatus(500);
    if (
      req.currentUser.role !== 'admin' &&
      !(job.owner as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    const notes = await noteServiceInstance.findByJob(job.id);
    return res.status(200).json(notes);
  } catch (e) {
    return next(e);
  }
});

route.delete('/:id', isAuth, attachUser, async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug(
    'Calling DELETE to /notes/:id endpoint with id: %s',
    req.params.id
  );
  try {
    const noteServiceInstance = Container.get(NoteService);
    const note = await noteServiceInstance.getRepo().findOne(req.params.id);
    if (
      req.currentUser.role !== 'admin' &&
      !(note.ownerId as ObjectID).equals(req.currentUser.id)
    ) {
      return res.sendStatus(403);
    }
    await noteServiceInstance.delete(req.params.id);
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
      body: Joi.string().required(),
      jobId: Joi.string().required(),
      boardId: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling POST to /notes/:id endpoint with body: %o', req.body);
    try {
      const noteServiceInstance = Container.get(NoteService);
      req.body.jobId = new mongoObjectID(req.body.jobId);
      req.body.boardId = new mongoObjectID(req.body.boardId);
      req.body.ownerId = req.currentUser.id;
      const note = await noteServiceInstance.create(new Note(req.body));
      return res.status(201).json(note);
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
      body: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const logger: Logger = Container.get('logger');
    logger.debug(
      'Calling PATCH to /notes/:id endpoint with body: %o',
      req.body
    );
    try {
      const noteServiceInstance = Container.get(NoteService);
      const note = await noteServiceInstance.getRepo().findOne(req.params.id);
      if (!note) return res.sendStatus(500);
      if (
        req.currentUser.role !== 'admin' &&
        !(note.ownerId as ObjectID).equals(req.currentUser.id)
      ) {
        return res.sendStatus(403);
      }
      const updatedNote = await noteServiceInstance.update(
        req.params.id,
        req.body
      );
      return res.status(200).json(updatedNote);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
