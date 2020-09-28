import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import { Inject, Service } from 'typedi';
import { User } from '../entity/User';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import { IUserInputDTO, IUserTokenObject } from '../interfaces/IUser';
import { validate } from 'class-validator';

@Service()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: MongoRepository<User>,
    @Inject('logger')
    private logger: Logger
  ) {}

  getRepo(): MongoRepository<User> {
    return this.userRepo;
  }

  async register(userInputDTO: IUserInputDTO): Promise<IUserTokenObject> {
    try {
      this.logger.debug('Hashing password');
      const hashedPassword = await bcrypt.hash(userInputDTO.password, 12);

      this.logger.debug('Creating user db record');
      const newUser = new User();
      newUser.fullName = userInputDTO.fullName;
      newUser.email = userInputDTO.email;
      newUser.password = hashedPassword;

      const errors = await validate(newUser, {
        validationError: { target: false },
      });
      if (errors.length > 0) throw errors;

      const userRecord: User = await this.userRepo.save(newUser);

      this.logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) throw new Error('User cannot be created');

      const user = userRecord;
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    } catch (e) {
      if (e.name === 'BulkWriteError') {
        e.message = 'The email address already exists';
      }
      throw e;
    }
  }

  async login(email: string, password: string): Promise<IUserTokenObject> {
    const userRecord = await this.userRepo.findOne({ email });
    if (!userRecord) throw new Error('Invalid email or password');

    this.logger.debug('Checking password');

    const validPassword = await bcrypt.compare(password, userRecord.password);

    if (validPassword) {
      this.logger.debug('Password is valid!');
      this.logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);
      const user = userRecord;
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    }
    throw new Error('Invalid email or password');
  }

  generateToken(userRecord: User): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 7);
    this.logger.debug(`Signing JWT for userId: ${userRecord.id}`);
    return jwt.sign(
      {
        id: userRecord.id,
        role: userRecord.role,
        fullName: userRecord.fullName,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret
    );
  }
}
