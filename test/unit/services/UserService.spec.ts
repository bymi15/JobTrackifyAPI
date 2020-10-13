import LoggerMock from '../mocks/LoggerMock';
import RepositoryMock from '../mocks/RepositoryMock';
import UserService from '../../../src/api/services/UserService';

describe('CRUD', () => {
  const repoMock = new RepositoryMock();
  let userServiceInstance: UserService;

  beforeAll(async (done) => {
    userServiceInstance = new UserService(repoMock as never, LoggerMock);
    done();
  });

  test('GetRepo should return the repo instance', async () => {
    const response = userServiceInstance.getRepo();
    expect(response).toBeDefined();
    expect(response).toEqual(repoMock);
  });
});
