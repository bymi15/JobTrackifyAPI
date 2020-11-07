import { Router } from 'express';
import auth from './auth';
import users from './users';
import companies from './companies';
import boards from './boards';
import boardColumns from './boardColumns';
import jobs from './jobs';
import geocode from './geocode';

const routes = Router();

routes.use('/auth', auth);
routes.use('/users', users);
routes.use('/companies', companies);
routes.use('/boards', boards);
routes.use('/boardColumns', boardColumns);
routes.use('/jobs', jobs);
routes.use('/geocode', geocode);

export default routes;
