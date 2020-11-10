import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config';
import { Inject, Service } from 'typedi';
import { User } from '../entities/User';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Logger } from 'winston';
import { IUserInputDTO, IUserResponseDTO } from '../../types';
import { validate } from 'class-validator';
import CRUD from './CRUD';
import { ErrorHandler } from '../../helpers/ErrorHandler';
import { Transporter } from 'nodemailer';
import VerifyEmailTemplate from '../../helpers/EmailTemplates/VerifyEmailTemplate';
import NewUserNotificationTemplate from '../../helpers/EmailTemplates/NewUserNotificationTemplate';

@Service()
export default class UserService extends CRUD<User> {
  constructor(
    @InjectRepository(User)
    protected userRepo: MongoRepository<User>,
    @Inject('logger')
    protected logger: Logger,
    @Inject('transporter')
    protected transporter: Transporter
  ) {
    super(userRepo, logger);
  }

  getRepo(): MongoRepository<User> {
    return this.userRepo;
  }

  async register(userInputDTO: IUserInputDTO): Promise<IUserResponseDTO> {
    this.logger.debug('User service - register');
    const hashedPassword = await bcrypt.hash(userInputDTO.password, 12);
    const newUser = new User({
      firstName: userInputDTO.firstName,
      lastName: userInputDTO.lastName,
      email: userInputDTO.email,
      password: hashedPassword,
    });

    const errors = await validate(newUser, {
      validationError: { target: false },
    });
    if (errors.length > 0) throw errors;
    const foundUser = await this.userRepo.findOne({ email: newUser.email });
    if (foundUser)
      throw new ErrorHandler(400, 'The email address already exists');

    const userRecord: User = await this.userRepo.save(newUser);
    if (!userRecord) throw new ErrorHandler(500, 'User cannot be created');

    const token = await this.generateAuthToken(userRecord);
    const user = userRecord;
    Reflect.deleteProperty(user, 'password');
    this.sendConfirmationEmail(user);
    this.sendNotificationEmail(user);
    return { user, token };
  }

  async login(email: string, password: string): Promise<IUserResponseDTO> {
    this.logger.debug('User service - login');
    const userRecord = await this.userRepo.findOne({ email });
    if (!userRecord) throw new ErrorHandler(401, 'Invalid email or password');

    const validPassword = await bcrypt.compare(password, userRecord.password);
    if (validPassword) {
      const token = await this.generateAuthToken(userRecord);
      const user = userRecord;
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    }
    throw new ErrorHandler(401, 'Invalid email or password');
  }

  async sendConfirmationEmail(user: User): Promise<void> {
    this.logger.debug(`Sending confirmation email to: ${user.email}`);
    if (config.testEnv) return;
    const emailToken = await this.generateEmailToken(user.id.toHexString());
    const url = `${config.baseURL}/confirmEmail/${emailToken}`;
    this.transporter.sendMail({
      from: 'Job Trackify contact@jobtrackify.com',
      to: user.email,
      subject: 'Welcome to Job Trackify - Confirm your email',
      html: VerifyEmailTemplate(user, url),
    });
  }

  async sendNotificationEmail(user: User): Promise<void> {
    this.logger.debug(`Sending notification email`);
    if (config.testEnv) return;
    this.transporter.sendMail({
      from: 'Job Trackify contact@jobtrackify.com',
      to: 'jobtrackify@gmail.com',
      subject: 'New User: ' + user.firstName + ' ' + user.lastName,
      html: NewUserNotificationTemplate(user),
    });
  }

  private async generateEmailToken(userId: string): Promise<string> {
    this.logger.debug(`Signing Email JWT for userId: ${userId}`);
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          id: userId,
        },
        config.emailSecret,
        { algorithm: 'HS256', expiresIn: '1d' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }

  private async generateAuthToken(userRecord: User): Promise<string> {
    this.logger.debug(`Signing JWT for userId: ${userRecord.id}`);
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          id: userRecord.id,
          role: userRecord.role,
          email: userRecord.email,
        },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: '3d' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }

  async find(): Promise<User[]> {
    const users = await this.repo.find();
    for (const user of users) {
      Reflect.deleteProperty(user, 'password');
    }
    return users;
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = await this.repo.findOne(id);
    if (user) {
      Reflect.deleteProperty(user, 'password');
    }
    return user;
  }

  async changePassword(
    user: User,
    data: {
      currentPassword: string;
      password: string;
    }
  ): Promise<User> {
    const userRecord = await this.userRepo.findOne({ email: user.email });
    if (!userRecord) throw new ErrorHandler(500, 'Invalid user');
    const validPassword = await bcrypt.compare(
      data.currentPassword,
      userRecord.password
    );
    if (validPassword) {
      const hashedPassword = await bcrypt.hash(data.password, 12);
      user.password = hashedPassword;
      return await this.repo.save(user);
    } else {
      throw new ErrorHandler(400, 'Invalid password');
    }
  }

  async confirmEmail(token: string): Promise<void> {
    const { id } = jwt.verify(token, config.emailSecret) as { id: string };
    const user = await this.repo.findOne(id);
    if (user && !user.emailConfirmed) {
      user.emailConfirmed = true;
      await this.repo.save(user);
    } else {
      throw new ErrorHandler(400, 'Invalid email confirmation token');
    }
  }
}
