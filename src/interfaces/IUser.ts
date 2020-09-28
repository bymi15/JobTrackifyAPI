import { User } from '../entity/User';

export interface IUserInputDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface IUserTokenObject {
  user: User;
  token: string;
}
