// import config from './src/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./src/config').default;

module.exports = {
  type: 'mongodb',
  url: config.databaseURL,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
  },
};
