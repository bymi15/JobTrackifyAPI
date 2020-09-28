import { Request, Response, Router } from 'express';
import { isAuth, attachCurrentUser } from '../middlewares';

const route = Router();

route.get('/', isAuth, attachCurrentUser, (req: Request, res: Response) => {
  return res.json({ user: req.currentUser }).status(200);
});

export default route;
