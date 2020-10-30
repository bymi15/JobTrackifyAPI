import commander from 'commander';
import databaseLoader from '../src/loaders/database';
import EntitySeed from '../src/database/seeds/EntitySeed';
import BoardSeed from '../src/database/seeds/BoardSeed';
import JobSeed from '../src/database/seeds/JobSeed';
import { User } from '../src/api/entities/User';
import { Company } from '../src/api/entities/Company';
import CompanyFactory from '../src/database/factories/CompanyFactory';
import UserFactory from '../src/database/factories/UserFactory';
import { Board } from '../src/api/entities/Board';
import BoardColumnFactory from '../src/database/factories/BoardColumnFactory';
import { BoardColumn } from '../src/api/entities/BoardColumn';
import { Job } from '../src/api/entities/Job';

commander
  .version('1.0.0')
  .description('Run seeders to fill your database with mock data')
  .option('-u, --user <number>', 'seed user <number> times', parseInt, 0)
  .option('-c, --company <number>', 'seed company <number> times', parseInt, 0)
  .option('-j, --job <number>', 'seed job <number> times', parseInt, 0)
  .option(
    '-jid, --jobUserId <string>',
    'seed job with jobUserId <string> times'
  )
  .parse(process.argv);

const run = async () => {
  const log = console.log;
  try {
    const connection = await databaseLoader();
    log('Database connection loaded successfully!');

    if (commander.user) {
      const users = await new EntitySeed(
        connection.getMongoRepository(User),
        UserFactory
      ).seedMany(commander.user);
      log(`${users.length} users created!`);
    }

    if (commander.company) {
      const companies = await new EntitySeed(
        connection.getMongoRepository(Company),
        CompanyFactory
      ).seedMany(commander.company);
      log(`${companies.length} companies created!`);
    }

    if (commander.job) {
      if (commander.jobUserId) {
        const user = await connection
          .getMongoRepository(User)
          .findOne(commander.jobUserId);
        if (!user) {
          log('Invalid job user id specified. Please try again.');
          return;
        }
        const board = await new BoardSeed(
          connection.getMongoRepository(Board),
          user.id
        ).seedOne();
        const boardColumn = await new EntitySeed<BoardColumn>(
          connection.getMongoRepository(BoardColumn),
          BoardColumnFactory
        ).seedOne();
        const company = await new EntitySeed(
          connection.getMongoRepository(Company),
          CompanyFactory
        ).seedOne();
        const jobs = [];
        for (let i = 0; i < commander.job; i++) {
          jobs.push(
            await new JobSeed(
              connection.getMongoRepository(Job),
              company.id,
              board.id,
              boardColumn.id,
              user.id
            ).seedOne({ sortOrder: (i + 1) * 1000 })
          );
        }
        log(`${jobs.length} jobs created!`);
      } else {
        log('You must specify a valid user id with -jid or --jobUserId param');
      }
    }
  } catch (err) {
    handleError(err);
  }
  process.exit(0);
};

const handleError = (err: Error) => {
  console.error(err);
  process.exit(1);
};

run();
