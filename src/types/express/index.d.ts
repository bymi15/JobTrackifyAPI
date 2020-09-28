import jwt from 'express-jwt';
import { User } from '../../entity/User';

declare global {
  namespace Express {
    export interface Request {
      currentUser: User;
      token: Token;
    }
  }

  export type Token = jwt.Options;
}
