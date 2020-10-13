import LoggerMock from '../mocks/LoggerMock';
import RepositoryMock from '../mocks/RepositoryMock';
import CompanyFactory from '../../../src/database/factories/CompanyFactory';
import { Company } from '../../../src/api/entities/Company';
import CRUD from '../../../src/api/services/CRUD';

describe('CRUD', () => {
  const repoMock = new RepositoryMock();
  let crudInstance: CRUD<Company>;

  beforeAll(async () => {
    crudInstance = new CRUD(repoMock as never, LoggerMock);
  });

  describe('fillObjectIdField', () => {
    test('Create should return the entity created', async () => {
      const mockCompany = CompanyFactory();
      const response = await crudInstance.create(mockCompany, 'name');

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.name).toEqual(mockCompany.name);
    });

    test('Find should return a list of entities', async () => {
      const response = await crudInstance.find();
      expect(response).toEqual([]);
    });

    test('FindOne should find an entity with a valid id', async () => {
      const mockid = 'mockId';
      const response = await crudInstance.findOne(mockid);

      expect(response).toBeDefined();
    });

    test('Update should return an entity', async () => {
      const mockid = 'mockId';
      const mockCompany = CompanyFactory();
      const response = await crudInstance.update(mockid, mockCompany);

      expect(response).toBeDefined();
      expect(response.name).toEqual(mockCompany.name);
    });

    test('Delete should return undefined', async () => {
      const mockid = 'mockId';
      const response = await crudInstance.delete(mockid);
      expect(response).toBeUndefined();
    });
  });
});
