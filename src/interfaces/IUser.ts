import { User } from '../entities/User';

export interface IUserInputDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserTokenObject {
  user: User;
  token: string;
}
