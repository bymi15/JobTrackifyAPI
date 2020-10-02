import { Container } from 'typedi';
import CompanyService from '../../src/api/services/company';
import databaseLoader from '../../src/loaders/database';
import CompanySeed from '../../src/database/seeds/CompanySeed';
import { Connection } from 'typeorm';
import Logger from '../../src/logger';
import CompanyFactory from '../../src/database/factories/CompanyFactory';
import { Company } from '../../src/api/entities/Company';
jest.mock('../../src/logger');

describe('CompanyService', () => {
  let connection: Connection;
  let companySeed: CompanySeed;
  let companyServiceInstance: CompanyService;
  beforeAll(async (done) => {
    Container.reset();
    connection = await databaseLoader();
    await connection.synchronize(true);
    companySeed = new CompanySeed(connection);
    Container.set('logger', Logger);
    companyServiceInstance = Container.get(CompanyService);
    done();
  });

  beforeEach(async (done) => {
    await connection.dropDatabase();
    done();
  });

  afterAll(async (done) => {
    if (connection.isConnected) {
      await connection.close();
    }
    done();
  });

  describe('create', () => {
    test('Should successfully create a company record', async () => {
      const mockCompany = CompanyFactory();
      const response = await companyServiceInstance.create(mockCompany);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.name).toEqual(mockCompany.name);
    });

    test('Should fail to create a company record if the company name already exists', async () => {
      const existingCompany = await companySeed.seedOne();
      let err: Error, response: Company;
      try {
        response = await companyServiceInstance.create(existingCompany);
      } catch (e) {
        err = e;
      }
      expect(response).toBeUndefined();
      expect(err).toEqual(new Error('The Company already exists'));
    });
  });
});
