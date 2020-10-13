import { Container } from 'typedi';
import { IUserInputDTO, IUserResponseDTO } from '../../src/types';
import UserService from '../../src/api/services/UserService';
import databaseLoader from '../../src/loaders/database';
import * as faker from 'faker';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import { User } from '../../src/api/entities/User';
import EntitySeed from '../../src/database/seeds/EntitySeed';
import UserFactory from '../../src/database/factories/UserFactory';
import { ErrorHandler } from '../../src/helpers/ErrorHandler';
jest.mock('../../src/logger');

describe('UserService', () => {
  let connection: Connection;
  let userSeed: EntitySeed<User>;
  let userServiceInstance: UserService;
  beforeAll(async () => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    userSeed = new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    );
    Container.set('logger', Logger);
    userServiceInstance = Container.get(UserService);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('register', () => {
    test('Should successfully create a user record', async () => {
      const mockUserInput: IUserInputDTO = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.random.word(),
      };
      const response = await userServiceInstance.register(mockUserInput);
      expect(response).toBeDefined();
      expect(response.user.id).toBeDefined();
      expect(response.user.firstName).toEqual(mockUserInput.firstName);
      expect(response.user.email).toEqual(mockUserInput.email);
      expect(response.token).toBeDefined();
    });

    test('Should fail to create a user record if the email exists', async () => {
      const mockUser = await userSeed.seedOne();
      const mockUserInput: IUserInputDTO = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: mockUser.email,
        password: faker.random.word(),
      };
      let err: ErrorHandler, response: IUserResponseDTO;
      try {
        response = await userServiceInstance.register(mockUserInput);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(
        new ErrorHandler(400, 'The email address already exists')
      );
    });
  });

  describe('login', () => {
    test('Should succeed with correct details', async () => {
      const mockPassword = faker.random.word();
      const mockUser = await userSeed.seedOne({
        password: mockPassword,
      });
      const response = await userServiceInstance.login(
        mockUser.email,
        mockPassword
      );
      expect(response).toBeDefined();
      expect(response.user.id).toBeDefined();
      expect(response.user.firstName).toEqual(mockUser.firstName);
      expect(response.user.email).toEqual(mockUser.email);
      expect(response.token).toBeDefined();
    });

    test('Should throw an error with incorrect details', async () => {
      const mockPassword = faker.random.word();
      const incorrectPassword = mockPassword + 'a';
      const mockUser = await userSeed.seedOne({
        password: mockPassword,
      });
      let err: ErrorHandler, response: IUserResponseDTO;
      try {
        response = await userServiceInstance.login(
          mockUser.email,
          incorrectPassword
        );
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(new ErrorHandler(401, 'Invalid email or password'));
    });
  });
});
