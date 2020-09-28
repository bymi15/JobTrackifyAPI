import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';

const routes = Router();

routes.use('/auth', auth);
routes.use('/user', user);

export default routes;
