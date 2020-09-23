import { Router } from 'express';
import { isAuth, attachCurrentUser } from '../middlewares';

const route = Router();

export default (app) => {
  app.use('/user', route);
  route.get('/', isAuth, attachCurrentUser, (req, res) => {
    return res.json({ user: req.currentUser }).status(200);
  });
};
