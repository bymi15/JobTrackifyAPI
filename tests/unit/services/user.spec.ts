import { Container } from 'typedi';
import { IUserInputDTO } from '../../../src/interfaces/IUser';
import UserService from '../../../src/services/user';
import databaseLoader from '../../../src/loaders/database';
import { Connection } from 'typeorm';
import Logger from '../../../src/logger';
jest.mock('../../../src/logger');

describe('User service unit tests', () => {
  let connection: Connection;
  beforeAll(async () => {
    Container.reset();
    Container.set('logger', Logger);
    connection = await databaseLoader('test');
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('register', () => {
    test('Should create a user record', async () => {
      const mockUserInput: IUserInputDTO = {
        fullName: 'mockFullName',
        email: 'test@example.com',
        password: 'mockPassword',
      };

      const userServiceInstance = Container.get(UserService);
      const userRecord = await userServiceInstance.register(mockUserInput);

      expect(userRecord).toBeDefined();
      expect(userRecord.user.id).toBeDefined();
      expect(userRecord.user.fullName).toEqual(mockUserInput.fullName);
    });
  });
});
