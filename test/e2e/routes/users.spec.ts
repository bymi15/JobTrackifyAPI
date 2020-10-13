import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import server from '../../../src/server';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { User } from '../../../src/api/entities/User';
jest.mock('../../../src/logger');

describe('UsersRoute', () => {
  let request: any;
  let connection: Connection;
  let userSeed: EntitySeed<User>;
  const baseUrl = '/api/users';

  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  beforeAll(async () => {
    const app = await server();
    request = supertest(app);
    Container.set('logger', Logger);
    connection = getConnection();
    await connection.dropDatabase();
    userSeed = new EntitySeed<User>(
      connection.getMongoRepository(User),
      UserFactory
    );
    const adminUser = await userSeed.seedOne({
      role: 'admin',
      password: 'adminPassword',
    });
    const staffUser = await userSeed.seedOne({
      role: 'staff',
      password: 'staffPassword',
    });
    const normalUser = await userSeed.seedOne({
      role: 'user',
      password: 'userPassword',
    });

    let res = await request.post('/api/auth/login').send({
      email: adminUser.email,
      password: 'adminPassword',
    });
    adminUserToken = `Bearer ${res.body.token}`;

    res = await request.post('/api/auth/login').send({
      email: staffUser.email,
      password: 'staffPassword',
    });
    staffUserToken = `Bearer ${res.body.token}`;

    res = await request.post('/api/auth/login').send({
      email: normalUser.email,
      password: 'userPassword',
    });
    normalUserToken = `Bearer ${res.body.token}`;
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /users', () => {
    it('should return a list of all users when requested by an admin user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
    });
    it('should return a forbidden error when requested by a staff user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return a forbidden error when requested by a normal user', async () => {
      const res = await request
        .get(baseUrl)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
  });
});
