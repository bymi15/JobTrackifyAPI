import LoggerMock from '../mocks/LoggerMock';
import RepositoryMock from '../mocks/RepositoryMock';
import CompanyFactory from '../../../src/database/factories/CompanyFactory';
import CompanyService from '../../../src/api/services/CompanyService';

describe('CRUD', () => {
  const repoMock = new RepositoryMock();
  let companyServiceInstance: CompanyService;

  beforeAll(async (done) => {
    companyServiceInstance = new CompanyService(repoMock as never, LoggerMock);
    done();
  });

  test('Create should return the entity created', async () => {
    const mockCompany = CompanyFactory();
    const response = await companyServiceInstance.create(mockCompany);

    expect(response).toBeDefined();
    expect(response.id).toBeDefined();
    expect(response.name).toEqual(mockCompany.name);
  });
});
