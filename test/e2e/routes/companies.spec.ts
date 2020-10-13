import supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import EntitySeed from '../../../src/database/seeds/EntitySeed';
import server from '../../../src/server';
import CompanyFactory from '../../../src/database/factories/CompanyFactory';
import UserFactory from '../../../src/database/factories/UserFactory';
import Logger from '../../../src/logger';
import Container from 'typedi';
import { Company } from '../../../src/api/entities/Company';
import { User } from '../../../src/api/entities/User';
jest.mock('../../../src/logger');

describe('CompaniesRoute', () => {
  let request: any;
  let connection: Connection;
  let companySeed: EntitySeed<Company>;
  const baseUrl = '/api/companies';

  let adminUserToken: string, staffUserToken: string, normalUserToken: string;
  beforeAll(async () => {
    const app = await server();
    request = supertest(app);
    Container.set('logger', Logger);
    connection = getConnection();
    await connection.dropDatabase();
    companySeed = new EntitySeed<Company>(
      connection.getMongoRepository(Company),
      CompanyFactory
    );
    const userSeed = new EntitySeed<User>(
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

  beforeEach(async () => {
    try {
      await connection.getMongoRepository(Company).clear();
    } catch (err) {}
  });

  afterAll(async () => {
    if (connection.isConnected) {
      await connection.close();
    }
  });

  describe('GET /companies', () => {
    it('should return a list of companies for admin user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].name).toEqual(mockCompanies.sort()[0].name);
    });
    it('should return a list of companies for staff user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].name).toEqual(mockCompanies.sort()[0].name);
    });
    it('should return a list of companies for normal user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(baseUrl)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body.sort()[0].name).toEqual(mockCompanies.sort()[0].name);
    });
    it('should return an unauthorized error without an auth token', async () => {
      await companySeed.seedOne();
      const res = await request.get(baseUrl);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /companies/:id', () => {
    it('should return a company by id for admin user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockCompanies[0].id}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockCompanies[0].id.toHexString());
      expect(res.body.name).toEqual(mockCompanies[0].name);
    });
    it('should return a company by id for staff user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockCompanies[0].id}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockCompanies[0].id.toHexString());
      expect(res.body.name).toEqual(mockCompanies[0].name);
    });
    it('should return a company by id for normal user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const res = await request
        .get(`${baseUrl}/${mockCompanies[0].id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(mockCompanies[0].id.toHexString());
      expect(res.body.name).toEqual(mockCompanies[0].name);
    });
    it('should return an internal server error with invalid company id', async () => {
      const mockCompany = await companySeed.seedOne();
      const invalidCompanyId = mockCompany.id.toHexString().split('').reverse();
      const res = await request
        .get(`${baseUrl}/${invalidCompanyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(500);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockCompany = await companySeed.seedOne();
      const res = await request.get(`${baseUrl}/${mockCompany.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should successfully delete a company by id for admin user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const mockCompanyId = mockCompanies[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request.get(baseUrl).set({ Authorization: adminUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should successfully delete a company by id for staff user', async () => {
      const mockCompanies = await companySeed.seedMany(3);
      const mockCompanyId = mockCompanies[0].id;
      let res = await request
        .delete(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(204);
      res = await request.get(baseUrl).set({ Authorization: staffUserToken });
      expect(res.body.length).toEqual(2);
      res = await request
        .get(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(404);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockCompany = await companySeed.seedOne();
      const res = await request
        .delete(`${baseUrl}/${mockCompany.id}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockCompany = await companySeed.seedOne();
      const res = await request.delete(`${baseUrl}/${mockCompany.id}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return an internal server error with invalid company id', async () => {
      const mockCompany = await companySeed.seedOne();
      const invalidCompanyId = mockCompany.id.toHexString().split('').reverse();
      const res = await request
        .delete(`${baseUrl}/${invalidCompanyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('POST /companies', () => {
    it('should successfully create a company for admin user', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(mockBody.name);
      expect(res.body.description).toEqual(mockBody.description);
      expect(res.body.logo).toEqual(mockBody.logo);
      expect(res.body.website).toEqual(mockBody.website);
      expect(res.body.headquarters).toEqual(mockBody.headquarters);
      expect(res.body.industry).toEqual(mockBody.industry);
      expect(res.body.foundedYear).toEqual(mockBody.foundedYear);
      const companyId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${companyId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(companyId);
    });
    it('should successfully create a company for staff user', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(mockBody.name);
      expect(res.body.description).toEqual(mockBody.description);
      expect(res.body.logo).toEqual(mockBody.logo);
      expect(res.body.website).toEqual(mockBody.website);
      expect(res.body.headquarters).toEqual(mockBody.headquarters);
      expect(res.body.industry).toEqual(mockBody.industry);
      expect(res.body.foundedYear).toEqual(mockBody.foundedYear);
      const companyId: string = res.body.id;
      res = await request
        .get(`${baseUrl}/${companyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(companyId);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      const res = await request.post(baseUrl).send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return a validation error if the name field is missing', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: '',
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      let res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      res = await request
        .post(baseUrl)
        .send({})
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if foundedYear is not a number string', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: 'mockInvalidFoundedYear',
      };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
    it('should return validation error if logo is not a valid url', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: 'mockInvalidLogo',
        website: mockCompany.website,
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
    it('should return validation error if website is not a valid url', async () => {
      const mockCompany = CompanyFactory();
      const mockBody = {
        name: mockCompany.name,
        description: mockCompany.description,
        logo: mockCompany.logo,
        website: 'mockInvalidWebsite',
        headquarters: mockCompany.headquarters,
        industry: mockCompany.industry,
        foundedYear: mockCompany.foundedYear,
      };
      const res = await request
        .post(baseUrl)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('PUT /companies', () => {
    it('should successfully update a company for admin user', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(mockCompany.name);
      expect(res.body.description).toEqual(mockCompany.description);
      const mockBody = {
        name: 'mockCompanyName',
        description: 'mockCompanyDescription',
      };
      res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: adminUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(mockBody.name);
      expect(res.body.description).toEqual(mockBody.description);
      expect(res.body.logo).toEqual(mockCompany.logo);
      expect(res.body.website).toEqual(mockCompany.website);
      expect(res.body.headquarters).toEqual(mockCompany.headquarters);
      expect(res.body.industry).toEqual(mockCompany.industry);
      expect(res.body.foundedYear).toEqual(mockCompany.foundedYear);
    });
    it('should successfully update a company for staff user', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      let res = await request
        .get(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(mockCompany.name);
      expect(res.body.description).toEqual(mockCompany.description);
      const mockBody = {
        name: 'mockCompanyName',
        description: 'mockCompanyDescription',
      };
      res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(mockBody.name);
      expect(res.body.description).toEqual(mockBody.description);
      expect(res.body.logo).toEqual(mockCompany.logo);
      expect(res.body.website).toEqual(mockCompany.website);
      expect(res.body.headquarters).toEqual(mockCompany.headquarters);
      expect(res.body.industry).toEqual(mockCompany.industry);
      expect(res.body.foundedYear).toEqual(mockCompany.foundedYear);
    });
    it('should return a forbidden error for normal user', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      const mockBody = {
        name: 'mockCompanyName',
        description: 'mockCompanyDescription',
      };
      let res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(403);
      res = await request
        .get(`${baseUrl}/${mockCompanyId}`)
        .set({ Authorization: normalUserToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(mockCompany.name);
      expect(res.body.description).toEqual(mockCompany.description);
    });
    it('should return an unauthorized error without an auth token', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      const mockBody = {
        name: 'mockCompanyName',
        description: 'mockCompanyDescription',
      };
      const res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
    it('should return validation error if foundedYear is not a number string', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      const mockBody = { foundedYear: 'mockInvalidFoundedYear' };
      const res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
    it('should return validation error if logo is not a valid url', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      const mockBody = { logo: 'mockInvalidLogoUrl' };
      const res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
    it('should return validation error if website is not a valid url', async () => {
      const mockCompany = await companySeed.seedOne();
      const mockCompanyId = mockCompany.id.toHexString();
      const mockBody = { website: 'mockInvalidWebsiteUrl' };
      const res = await request
        .put(`${baseUrl}/${mockCompanyId}`)
        .send(mockBody)
        .set({ Authorization: staffUserToken });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
});
