import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Logger from '../loaders/logger';
import User from '../models/user';
import config from '../config';

export default class AuthService {
  static async register(userInputDTO) {
    try {
      Logger.debug('Hashing password');
      const hashedPassword = await bcrypt.hash(userInputDTO.password, 12);

      Reflect.deleteProperty(userInputDTO, 'password');

      Logger.debug('Creating user db record');
      const userRecord = await User.create({
        ...userInputDTO,
        password: hashedPassword,
      });

      Logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      //   Logger.debug('Sending welcome email');
      //   await this.mailer.SendWelcomeEmail(userRecord);
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  static async login(email, password) {
    const userRecord = await User.findOne({ email });
    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    Logger.debug('Checking password');

    const validPassword = await bcrypt.compare(password, userRecord.password);

    if (validPassword) {
      Logger.debug('Password is valid!');
      Logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    }
    throw new Error('Invalid email or password');
  }

  static generateToken(userRecord) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 7);
    Logger.debug(`Signing JWT for userId: ${userRecord._id}`);
    return jwt.sign(
      {
        _id: userRecord._id,
        role: userRecord.role,
        name: userRecord.name,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret
    );
  }
}
