import { Router } from 'express';
import auth from './auth';
import user from './user';
import company from './company';
import board from './board';

const routes = Router();

routes.use('/auth', auth);
routes.use('/user', user);
routes.use('/company', company);
routes.use('/board', board);

export default routes;
