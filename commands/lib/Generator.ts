const fs = require('fs').promises;
import pluralize from 'pluralize';

const camelCase = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1);

const pascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const pluralizeLastWord = (str: string): string => {
  let foundIndex = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str.charAt(i) == str.charAt(i).toUpperCase()) {
      foundIndex = i;
      break;
    }
  }
  const pluralWord = pluralize(str.substring(foundIndex));
  return str.substring(0, foundIndex) + pluralWord;
};

export default class Generator {
  private entityName: string;
  private fields: unknown;
  private entityPath = 'src/api/entities/';
  private servicePath = 'src/api/services/';
  private routePath = 'src/api/routes/';
  private factoryPath = 'src/database/factories/';
  private testPath = 'test/integration/';
  private e2ePath = 'test/e2e/routes/';

  constructor(
    entityName: string,
    entityPath?: string,
    servicePath?: string,
    routePath?: string,
    factoryPath?: string,
    testPath?: string,
    e2ePath?: string
  ) {
    this.entityName = entityName;
    this.entityPath = this.entityPath || entityPath;
    this.servicePath = this.servicePath || servicePath;
    this.routePath = this.routePath || routePath;
    this.factoryPath = this.factoryPath || factoryPath;
    this.testPath = this.testPath || testPath;
    this.e2ePath = this.e2ePath || e2ePath;
  }

  public readEntityFields = async (): Promise<unknown> => {
    const fields = {};
    try {
      const entitySource: string = await fs.readFile(
        this.entityPath + this.entityName + '.ts',
        'utf8'
      );
      const lines = entitySource.split('\n');
      let obj = null;
      for (const line of lines) {
        const ind: number = line.indexOf('?:');
        if (
          ind !== -1 &&
          line.indexOf(' id?:') === -1 &&
          line.indexOf('constructor') === -1
        ) {
          const fieldName = line.substring(0, ind).trim();
          if (line.indexOf('}') !== -1) obj = null;
          if (line.indexOf('{') === -1) {
            if (obj) {
              fields[obj][fieldName] = '';
            } else {
              fields[fieldName] = '';
            }
          } else {
            fields[fieldName] = {};
            obj = fieldName;
          }
        }
      }
    } catch (err) {
      console.log(err);
      return null;
    }
    this.fields = fields;
    return fields;
  };

  private entityCode = (fields: string): string => {
    let res =
      "import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';\n" +
      "import { IsString } from 'class-validator';\n" +
      '\n' +
      '@Entity()\n' +
      'export class ' +
      this.entityName +
      ' {\n' +
      '  @ObjectIdColumn()\n' +
      '  id?: ObjectID;\n';
    if (fields) {
      const fieldsArr = fields.split(' ');
      for (const field of fieldsArr) {
        res +=
          '\n' +
          '  @Column()\n' +
          '  @IsString()\n' +
          `  ${field.trim()}?: string;\n`;
      }
      res +=
        '\n' +
        `  public constructor(data?: ${this.entityName}) {\n` +
        '    if (data) {\n';
      for (const field of fieldsArr) {
        const trimmedField = field.trim();
        res += `      this.${trimmedField} = data.${trimmedField};\n`;
      }
      res += '      }\n' + '    }\n' + '  }\n';
    } else {
      res +=
        '\n' +
        '  @Column()\n' +
        '  @IsString()\n' +
        '  field?: string;\n' +
        '\n' +
        `  public constructor(data?: ${this.entityName}) {\n` +
        '    if (data) {\n' +
        '      this.field = data.field;\n' +
        '    }\n' +
        '  }\n' +
        '}\n';
    }
    return res;
  };

  private serviceCode = (): string => {
    return (
      "import { Inject, Service } from 'typedi';\n" +
      `import { ${this.entityName} } from '../entities/${this.entityName}';\n` +
      "import { MongoRepository } from 'typeorm';\n" +
      "import { InjectRepository } from 'typeorm-typedi-extensions';\n" +
      "import { Logger } from 'winston';\n" +
      "import CRUD from './CRUD';\n" +
      '\n' +
      '@Service()\n' +
      `export default class ${this.entityName}Service extends CRUD<${this.entityName}> {\n` +
      '  constructor(\n' +
      `    @InjectRepository(${this.entityName})\n` +
      `    protected repo: MongoRepository<${this.entityName}>,\n` +
      "    @Inject('logger')\n" +
      '    protected logger: Logger\n' +
      '  ) {\n' +
      '    super(repo, logger);\n' +
      '  }\n' +
      '\n' +
      `  async create(${camelCase(this.entityName)}: ${
        this.entityName
      }): Promise<${this.entityName}> {\n` +
      `    return await super.create(${camelCase(
        this.entityName
      )}, 'uniqueFieldName');\n` +
      '  }\n' +
      '}\n'
    );
  };

  private routeFunctionHeader = (
    method: string,
    routePath: string,
    validation?: string
  ): string => {
    if (validation) {
      return (
        `route.${method}(\n` +
        `  '${routePath}',\n` +
        '  isAuth,\n' +
        '  celebrate({\n' +
        '    body: Joi.object({\n' +
        validation +
        '    }),\n' +
        '  }),\n' +
        '  async (req, res, next) => {\n'
      );
    }

    return `route.${method}('${routePath}', isAuth, async (req, res, next) => {\n`;
  };

  private routeValidation = (fields: unknown, required?: boolean): string => {
    let res = '';
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value !== null) {
        res += `      ${key}: Joi.object({\n`;
        for (const [_key, _value] of Object.entries(value)) {
          res += `        ${_key}: Joi.string()${
            required ? '.required()' : ''
          },\n`;
        }
        res += `      })${required ? '.required()' : ''},\n`;
      } else {
        res += `      ${key}: Joi.string()${required ? '.required()' : ''},\n`;
      }
    }
    return res;
  };

  private routeCode = (fields: unknown): string => {
    return (
      "import { Router } from 'express';\n" +
      "import { Container } from 'typedi';\n" +
      "import { celebrate, Joi } from 'celebrate';\n" +
      `import ${this.entityName}Service from '../services/${this.entityName}Service';\n` +
      "import { Logger } from 'winston';\n" +
      `import { ${this.entityName} } from '../entities/${this.entityName}';\n` +
      "import { isAuth } from '../middlewares';\n" +
      '\n' +
      'const route = Router();\n' +
      '\n' +
      this.routeFunctionHeader('get', '/') +
      "  const logger: Logger = Container.get('logger');\n" +
      `  logger.debug('Calling GET to /${camelCase(
        pluralizeLastWord(this.entityName)
      )} endpoint');\n` +
      '  try {\n' +
      `    const ${camelCase(this.entityName)}ServiceInstance = Container.get(${
        this.entityName
      }Service);\n` +
      `    const ${camelCase(
        pluralizeLastWord(this.entityName)
      )} = await ${camelCase(this.entityName)}ServiceInstance.find();\n` +
      `    return res.status(200).json(${camelCase(
        pluralizeLastWord(this.entityName)
      )});\n` +
      '  } catch (e) {\n' +
      '    return next(e);\n' +
      '  }\n' +
      '});\n' +
      '\n' +
      this.routeFunctionHeader('get', '/:id') +
      "  const logger: Logger = Container.get('logger');\n" +
      `  logger.debug('Calling GET to /${camelCase(
        pluralizeLastWord(this.entityName)
      )}/:id endpoint with id: %s', req.params.id);\n` +
      '  try {\n' +
      `    const ${camelCase(this.entityName)}ServiceInstance = Container.get(${
        this.entityName
      }Service);\n` +
      `    const ${camelCase(this.entityName)} = await ${camelCase(
        this.entityName
      )}ServiceInstance.findOne(req.params.id);\n` +
      `    return res.status(200).json(${camelCase(this.entityName)});\n` +
      '  } catch (e) {\n' +
      '    return next(e);\n' +
      '  }\n' +
      '});\n' +
      '\n' +
      this.routeFunctionHeader('delete', '/:id') +
      "  const logger: Logger = Container.get('logger');\n" +
      `  logger.debug('Calling DELETE to /${camelCase(
        pluralizeLastWord(this.entityName)
      )}/:id endpoint with id: %s', req.params.id);\n` +
      '  try {\n' +
      `    const ${camelCase(this.entityName)}ServiceInstance = Container.get(${
        this.entityName
      }Service);\n` +
      `    await ${camelCase(
        this.entityName
      )}ServiceInstance.delete(req.params.id);\n` +
      `    return res.status(204).end();\n` +
      '  } catch (e) {\n' +
      '    return next(e);\n' +
      '  }\n' +
      '});\n' +
      '\n' +
      this.routeFunctionHeader(
        'post',
        '/',
        this.routeValidation(fields, true)
      ) +
      "    const logger: Logger = Container.get('logger');\n" +
      `    logger.debug('Calling POST to /${camelCase(
        pluralizeLastWord(this.entityName)
      )}/:id endpoint with body: %o', req.body);\n` +
      '    try {\n' +
      `      const ${camelCase(
        this.entityName
      )}ServiceInstance = Container.get(${this.entityName}Service);\n` +
      `      const ${camelCase(this.entityName)} = await ${camelCase(
        this.entityName
      )}ServiceInstance.create(\n` +
      `        new ${this.entityName}(req.body)\n` +
      '      );\n' +
      `      return res.status(201).json(${camelCase(this.entityName)});\n` +
      '    } catch (e) {\n' +
      '      return next(e);\n' +
      '    }\n' +
      '  });\n' +
      '\n' +
      this.routeFunctionHeader('patch', '/:id', this.routeValidation(fields)) +
      "    const logger: Logger = Container.get('logger');\n" +
      `    logger.debug('Calling PATCH to /${camelCase(
        pluralizeLastWord(this.entityName)
      )}/:id endpoint with body: %o', req.body);\n` +
      '    try {\n' +
      `      const ${camelCase(
        this.entityName
      )}ServiceInstance = Container.get(${this.entityName}Service);\n` +
      `      const ${camelCase(this.entityName)} = await ${camelCase(
        this.entityName
      )}ServiceInstance.update(\n` +
      `        req.params.id,\n` +
      `        req.body\n` +
      '      );\n' +
      `      return res.status(200).json(${camelCase(this.entityName)});\n` +
      '    } catch (e) {\n' +
      '      return next(e);\n' +
      '    }\n' +
      '  }\n' +
      ');\n' +
      '\n' +
      'export default route;\n'
    );
  };

  private factoryCode = (fields: unknown): string => {
    let res =
      `import { ${this.entityName} } from '../../api/entities/${this.entityName}';\n` +
      "import * as faker from 'faker';\n" +
      '\n' +
      `export default (data?: ${this.entityName}): ${this.entityName} => {\n` +
      `  const ${camelCase(this.entityName)} = new ${this.entityName}({\n`;

    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value !== null) {
        res += `    ${key}: (data && data.${key}) || {\n`;
        for (const [_key, _value] of Object.entries(value)) {
          res += `      ${_key}: faker.random.word(),\n`;
        }
        res += '    },\n';
      } else {
        res += `    ${key}: (data && data.${key}) || faker.random.word(),\n`;
      }
    }
    res += '  });\n' + `  return ${camelCase(this.entityName)};\n` + '};\n';
    return res;
  };

  private testCode = (): string =>
    "import { Container } from 'typedi';\n" +
    `import ${this.entityName}Service from '../../src/api/services/${this.entityName}Service';\n` +
    "import databaseLoader from '../../src/loaders/database';\n" +
    "import { Connection } from 'typeorm';\n" +
    "import Logger from '../../src/logger';\n" +
    `import ${this.entityName}Factory from '../../src/database/factories/${this.entityName}Factory';\n` +
    `import { ${this.entityName} } from '../../src/api/entities/${this.entityName}';\n` +
    "import EntitySeed from '../../src/database/seeds/EntitySeed';\n" +
    "import { ErrorHandler } from '../../src/helpers/ErrorHandler';\n" +
    "jest.mock('../../src/logger');\n" +
    '\n' +
    `describe('${this.entityName}Service', () => {\n` +
    '  let connection: Connection;\n' +
    `  let ${camelCase(this.entityName)}Seed: EntitySeed<${
      this.entityName
    }>;\n` +
    `  let ${camelCase(this.entityName)}ServiceInstance: ${
      this.entityName
    }Service;\n` +
    '  beforeAll(async () => {\n' +
    '    Container.reset();\n' +
    '    connection = await databaseLoader();\n' +
    '    await connection.synchronize(true);\n' +
    `    ${camelCase(this.entityName)}Seed = new EntitySeed<${
      this.entityName
    }>(\n` +
    `      connection.getMongoRepository(${this.entityName}),\n` +
    `      ${this.entityName}Factory\n` +
    '    );\n' +
    "    Container.set('logger', Logger);\n" +
    `    ${camelCase(this.entityName)}ServiceInstance = Container.get(${
      this.entityName
    }Service);\n` +
    '  });\n' +
    '\n' +
    '  beforeEach(async () => {\n' +
    '    await connection.dropDatabase();\n' +
    '  });\n' +
    '\n' +
    '  afterAll(async () => {\n' +
    '    if (connection.isConnected) {\n' +
    '      await connection.close();\n' +
    '    }\n' +
    '  });\n' +
    '\n' +
    "  describe('create', () => {\n" +
    `    test('Should successfully create a ${camelCase(
      this.entityName
    )} record', async () => {\n` +
    `      const mock${this.entityName} = ${this.entityName}Factory();\n` +
    `      const response = await ${camelCase(
      this.entityName
    )}ServiceInstance.create(mock${this.entityName});\n` +
    '      expect(response).toBeDefined();\n' +
    '      expect(response.id).toBeDefined();\n' +
    '    });\n' +
    '\n' +
    `    test('Should fail to create a ${camelCase(
      this.entityName
    )} record if the ${camelCase(
      this.entityName
    )} already exists', async () => {\n` +
    `      const existing${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      let err: ErrorHandler, response: ${this.entityName};\n` +
    '      try {\n' +
    `        response = await ${camelCase(
      this.entityName
    )}ServiceInstance.create(existing${this.entityName});\n` +
    '      } catch (e) {\n' +
    '        err = e;\n' +
    '      }\n' +
    '      expect(response).toBeUndefined();\n' +
    `      expect(err).toEqual(new ErrorHandler(400, 'The ${this.entityName} already exists'));\n` +
    '    });\n' +
    '  });\n' +
    '});\n';

  private e2eCode = (fieldName: string): string =>
    "import supertest from 'supertest';\n" +
    "import { Connection, getConnection } from 'typeorm';\n" +
    "import EntitySeed from '../../../src/database/seeds/EntitySeed';\n" +
    "import server from '../../../src/server';\n" +
    `import ${this.entityName}Factory from '../../../src/database/factories/${this.entityName}Factory';\n` +
    "import UserFactory from '../../../src/database/factories/UserFactory';\n" +
    "import Logger from '../../../src/logger';\n" +
    "import Container from 'typedi';\n" +
    `import { ${this.entityName} } from '../../../src/api/entities/${this.entityName}';\n` +
    "import { User } from '../../../src/api/entities/User';\n" +
    "jest.mock('../../../src/logger');\n" +
    '\n' +
    `describe('${this.entityName}Route', () => {\n` +
    '  let request: any;\n' +
    '  let connection: Connection;\n' +
    `  let ${camelCase(this.entityName)}Seed: EntitySeed<${
      this.entityName
    }>;\n` +
    `  const baseUrl = '/api/${camelCase(
      pluralizeLastWord(this.entityName)
    )}';\n` +
    '  let adminUserToken: string, staffUserToken: string, normalUserToken: string;\n' +
    '  beforeAll(async () => {\n' +
    '    const app = await server();\n' +
    '    request = supertest(app);\n' +
    "    Container.set('logger', Logger);\n" +
    '    connection = getConnection();\n' +
    '    await connection.dropDatabase();\n' +
    `    ${camelCase(this.entityName)}Seed = new EntitySeed<${
      this.entityName
    }>(\n` +
    `      connection.getMongoRepository(${this.entityName}),\n` +
    `      ${this.entityName}Factory\n` +
    '    );\n' +
    '    const userSeed = new EntitySeed<User>(\n' +
    '      connection.getMongoRepository(User),\n' +
    '      UserFactory\n' +
    '    );\n' +
    '    const adminUser = await userSeed.seedOne({\n' +
    "      role: 'admin',\n" +
    "      password: 'adminPassword',\n" +
    '    });\n' +
    '    const staffUser = await userSeed.seedOne({\n' +
    "      role: 'staff',\n" +
    "      password: 'staffPassword',\n" +
    '    });\n' +
    '    const normalUser = await userSeed.seedOne({\n' +
    "      role: 'user',\n" +
    "      password: 'userPassword',\n" +
    '    });\n' +
    "    let res = await request.post('/api/auth/login').send({\n" +
    '      email: adminUser.email,\n' +
    "      password: 'adminPassword',\n" +
    '    });\n' +
    '    adminUserToken = `Bearer ${res.body.token}`;\n' +
    "    res = await request.post('/api/auth/login').send({\n" +
    '      email: staffUser.email,\n' +
    "      password: 'staffPassword',\n" +
    '    });\n' +
    '    staffUserToken = `Bearer ${res.body.token}`;\n' +
    "    res = await request.post('/api/auth/login').send({\n" +
    '      email: normalUser.email,\n' +
    "      password: 'userPassword',\n" +
    '    });\n' +
    '    normalUserToken = `Bearer ${res.body.token}`;\n' +
    '  });\n' +
    '\n' +
    '  beforeEach(async () => {\n' +
    '    try {\n' +
    `      await connection.getMongoRepository(${this.entityName}).clear();\n` +
    '    } catch (err) {}\n' +
    '  });\n' +
    '\n' +
    '  afterAll(async () => {\n' +
    '    if (connection.isConnected) {\n' +
    '      await connection.close();\n' +
    '    }\n' +
    '  });\n' +
    '\n' +
    `  describe('GET /${camelCase(
      pluralizeLastWord(this.entityName)
    )}', () => {\n` +
    `    it('should return a list of ${camelCase(
      pluralizeLastWord(this.entityName)
    )} for admin user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(baseUrl)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    '      expect(res.body.length).toEqual(3);\n' +
    '      expect(res.body.sort()[0].id).toEqual(\n' +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].id.toHexString()\n` +
    '      );\n' +
    `      expect(res.body.sort()[0].${fieldName}).toEqual(\n` +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].${fieldName}\n` +
    '      );\n' +
    '    });\n' +
    `    it('should return a list of ${camelCase(
      pluralizeLastWord(this.entityName)
    )} for staff user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(baseUrl)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    '      expect(res.body.length).toEqual(3);\n' +
    '      expect(res.body.sort()[0].id).toEqual(\n' +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].id.toHexString()\n` +
    '      );\n' +
    `      expect(res.body.sort()[0].${fieldName}).toEqual(\n` +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].${fieldName}\n` +
    '      );\n' +
    '    });\n' +
    `    it('should return a list of ${camelCase(
      pluralizeLastWord(this.entityName)
    )} for normal user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(baseUrl)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    '      expect(res.body.length).toEqual(3);\n' +
    '      expect(res.body.sort()[0].id).toEqual(\n' +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].id.toHexString()\n` +
    '      );\n' +
    `      expect(res.body.sort()[0].${fieldName}).toEqual(\n` +
    `        mock${pluralizeLastWord(
      this.entityName
    )}.sort()[0].${fieldName}\n` +
    '      );\n' +
    '    });\n' +
    "    it('should return an unauthorized error without an auth token', async () => {\n" +
    `      await ${camelCase(this.entityName)}Seed.seedOne();\n` +
    '      const res = await request.get(baseUrl);\n' +
    '      expect(res.statusCode).toEqual(401);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    '  });\n' +
    '\n' +
    `  describe('GET /${camelCase(
      pluralizeLastWord(this.entityName)
    )}/:id', () => {\n` +
    `    it('should return a ${camelCase(
      this.entityName
    )} by id for admin user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    pluralizeLastWord(this.entityName) +
    '[0].id}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].${fieldName});\n` +
    '    });\n' +
    `    it('should return a ${camelCase(
      this.entityName
    )} by id for staff user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    pluralizeLastWord(this.entityName) +
    '[0].id}`)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].${fieldName});\n` +
    '    });\n' +
    `    it('should return a ${camelCase(
      this.entityName
    )} by id for normal user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    '      const res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    pluralizeLastWord(this.entityName) +
    '[0].id}`)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${pluralizeLastWord(
      this.entityName
    )}[0].${fieldName});\n` +
    '    });\n' +
    `    it('should return an internal server error with invalid ${camelCase(
      this.entityName
    )} id', async () => {\n` +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mockInvalidId = mock${this.entityName}.id\n` +
    '        .toHexString()\n' +
    "        .split('')\n" +
    '        .reverse();\n' +
    '      const res = await request\n' +
    '        .get(`${baseUrl}/${mockInvalidId}`)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(500);\n' +
    '    });\n' +
    "    it('should return an unauthorized error without an auth token', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    '      const res = await request.get(`${baseUrl}/${mock' +
    this.entityName +
    '.id}`);\n' +
    '      expect(res.statusCode).toEqual(401);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    '  });\n' +
    '\n' +
    `  describe('DELETE /${camelCase(
      pluralizeLastWord(this.entityName)
    )}/:id', () => {\n` +
    `    it('should successfully delete a ${camelCase(
      this.entityName
    )} by id for admin user', async () => {\n` +
    `      const mock${pluralizeLastWord(this.entityName)} = await ${camelCase(
      this.entityName
    )}Seed.seedMany(3);\n` +
    `      const mock${this.entityName}Id = mock${pluralizeLastWord(
      this.entityName
    )}[0].id;\n` +
    '      let res = await request\n' +
    '        .delete(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(204);\n' +
    '      res = await request.get(baseUrl).set({ Authorization: adminUserToken });\n' +
    '      expect(res.body.length).toEqual(2);\n' +
    '      res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(404);\n' +
    '    });\n' +
    "    it('should return a forbidden error for staff user', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    '      const res = await request\n' +
    '        .delete(`${baseUrl}/${mock' +
    this.entityName +
    '.id}`)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '    });\n' +
    "    it('should return a forbidden error for normal user', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    '      const res = await request\n' +
    '        .delete(`${baseUrl}/${mock' +
    this.entityName +
    '.id}`)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '    });\n' +
    "    it('should return an unauthorized error without an auth token', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    '      const res = await request.delete(`${baseUrl}/${mock' +
    this.entityName +
    '.id}`);\n' +
    '      expect(res.statusCode).toEqual(401);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    `    it('should return an internal server error with invalid ${camelCase(
      this.entityName
    )} id', async () => {\n` +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mockInvalidId = mock${this.entityName}.id\n` +
    '        .toHexString()\n' +
    "        .split('')\n" +
    '        .reverse();\n' +
    '      const res = await request\n' +
    '        .delete(`${baseUrl}/${mockInvalidId}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(500);\n' +
    '    });\n' +
    '  });\n' +
    '\n' +
    `  describe('POST /${camelCase(
      pluralizeLastWord(this.entityName)
    )}', () => {\n` +
    `    it('should successfully create a ${camelCase(
      this.entityName
    )} for admin user', async () => {\n` +
    `      const mock${this.entityName} = ${this.entityName}Factory();\n` +
    `      const mockBody = { ${fieldName}: mock${this.entityName}.${fieldName} };\n` +
    '      let res = await request\n' +
    '        .post(baseUrl)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(201);\n' +
    "      expect(res.body).toHaveProperty('id');\n" +
    `      expect(res.body.${fieldName}).toEqual(mockBody.${fieldName});\n` +
    `      const ${camelCase(this.entityName)}Id: string = res.body.id;\n` +
    '      res = await request\n' +
    '        .get(`${baseUrl}/${' +
    camelCase(this.entityName) +
    'Id}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(${camelCase(this.entityName)}Id);\n` +
    '    });\n' +
    "    it('should return a forbidden error for staff user', async () => {\n" +
    `      const mock${this.entityName} = ${this.entityName}Factory();\n` +
    `      const mockBody = { ${fieldName}: mock${this.entityName}.${fieldName} };\n` +
    '      const res = await request\n' +
    '        .post(baseUrl)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '    });\n' +
    "    it('should return a forbidden error for normal user', async () => {\n" +
    `      const mock${this.entityName} = ${this.entityName}Factory();\n` +
    `      const mockBody = { ${fieldName}: mock${this.entityName}.${fieldName} };\n` +
    '      const res = await request\n' +
    '        .post(baseUrl)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '    });\n' +
    "    it('should return an unauthorized error without an auth token', async () => {\n" +
    `      const mock${this.entityName} = ${this.entityName}Factory();\n` +
    `      const mockBody = { ${fieldName}: mock${this.entityName}.${fieldName} };\n` +
    '      const res = await request.post(baseUrl).send(mockBody);\n' +
    '      expect(res.statusCode).toEqual(401);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    `    it('should return a validation error if the ${fieldName} field is missing', async () => {\n` +
    '      let res = await request\n' +
    '        .post(baseUrl)\n' +
    `        .send({ ${fieldName}: '' })\n` +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(400);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '      res = await request\n' +
    '        .post(baseUrl)\n' +
    '        .send({})\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(400);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    '  });\n' +
    '\n' +
    `  describe('PATCH /${camelCase(
      pluralizeLastWord(this.entityName)
    )}/:id', () => {\n` +
    `    it('should successfully update a ${camelCase(
      this.entityName
    )} for admin user', async () => {\n` +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mock${this.entityName}Id = mock${this.entityName}.id.toHexString();\n` +
    '      let res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${this.entityName}.id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${this.entityName}.${fieldName});\n` +
    `      const mockBody = { ${fieldName}: 'mock${this.entityName}${pascalCase(
      fieldName
    )}' };\n` +
    '      res = await request\n' +
    '        .patch(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    "      expect(res.body).toHaveProperty('id');\n" +
    `      expect(res.body.${fieldName}).toEqual(mockBody.${fieldName});\n` +
    '    });\n' +
    "    it('should return a forbidden error for staff user', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mock${this.entityName}Id = mock${this.entityName}.id.toHexString();\n` +
    `      const mockBody = { ${fieldName}: 'mock${this.entityName}${pascalCase(
      fieldName
    )}' };\n` +
    '      let res = await request\n' +
    '        .patch(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '      res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .set({ Authorization: staffUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${this.entityName}.id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${this.entityName}.${fieldName});\n` +
    '    });\n' +
    "    it('should return a forbidden error for normal user', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mock${this.entityName}Id = mock${this.entityName}.id.toHexString();\n` +
    `      const mockBody = { ${fieldName}: 'mock${this.entityName}${pascalCase(
      fieldName
    )}' };\n` +
    '      let res = await request\n' +
    '        .patch(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(403);\n' +
    '      res = await request\n' +
    '        .get(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .set({ Authorization: normalUserToken });\n' +
    '      expect(res.statusCode).toEqual(200);\n' +
    `      expect(res.body.id).toEqual(mock${this.entityName}.id.toHexString());\n` +
    `      expect(res.body.${fieldName}).toEqual(mock${this.entityName}.${fieldName});\n` +
    '    });\n' +
    "    it('should return an unauthorized error without an auth token', async () => {\n" +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mock${this.entityName}Id = mock${this.entityName}.id.toHexString();\n` +
    `      const mockBody = { ${fieldName}: 'mock${this.entityName}${pascalCase(
      fieldName
    )}' };\n` +
    '      const res = await request\n' +
    '        .patch(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .send(mockBody);\n' +
    '      expect(res.statusCode).toEqual(401);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    `    it('should return validation error if ${fieldName} is not a valid string', async () => {\n` +
    `      const mock${this.entityName} = await ${camelCase(
      this.entityName
    )}Seed.seedOne();\n` +
    `      const mock${this.entityName}Id = mock${this.entityName}.id.toHexString();\n` +
    `      const mockBody = { ${fieldName}: 123 };\n` +
    '      const res = await request\n' +
    '        .patch(`${baseUrl}/${mock' +
    this.entityName +
    'Id}`)\n' +
    '        .send(mockBody)\n' +
    '        .set({ Authorization: adminUserToken });\n' +
    '      expect(res.statusCode).toEqual(400);\n' +
    "      expect(res.body).toHaveProperty('error');\n" +
    '    });\n' +
    '  });\n' +
    '});\n';
  public generateEntity = async (fields: string): Promise<string> => {
    const filePath: string = this.entityPath + this.entityName + '.ts';
    await fs.writeFile(filePath, this.entityCode(fields));
    return filePath;
  };

  public generateService = async (): Promise<string> => {
    const filePath: string = this.servicePath + this.entityName + 'Service.ts';
    await fs.writeFile(filePath, this.serviceCode());
    return filePath;
  };

  public generateRoute = async (): Promise<string> => {
    const fields = this.fields || (await this.readEntityFields());
    const filePath: string =
      this.routePath + camelCase(pluralizeLastWord(this.entityName)) + '.ts';
    await fs.writeFile(filePath, this.routeCode(fields));
    return filePath;
  };

  public generateFactory = async (): Promise<string> => {
    const fields = this.fields || (await this.readEntityFields());
    const filePath: string = this.factoryPath + this.entityName + 'Factory.ts';
    await fs.writeFile(filePath, this.factoryCode(fields));
    return filePath;
  };

  public generateTest = async (): Promise<string> => {
    const filePath: string =
      this.testPath + this.entityName + 'Service.spec.ts';
    await fs.writeFile(filePath, this.testCode());
    return filePath;
  };

  public generateE2E = async (): Promise<string> => {
    const fields = this.fields || (await this.readEntityFields());
    const filePath: string =
      this.e2ePath + camelCase(pluralizeLastWord(this.entityName)) + '.spec.ts';
    await fs.writeFile(filePath, this.e2eCode(Object.keys(fields)[0]));
    return filePath;
  };
}
