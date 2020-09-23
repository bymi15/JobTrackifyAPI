import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';

export default class AuthService {
  constructor(container) {
    this.userModel = container.get('userModel');
    this.logger = container.get('logger');
  }

  async register(userInputDTO) {
    try {
      this.logger.debug('Hashing password');
      const hashedPassword = await bcrypt.hash(userInputDTO.password, 12);

      Reflect.deleteProperty(userInputDTO, 'password');

      this.logger.debug('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        password: hashedPassword,
      });

      this.logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      //   this.logger.debug('Sending welcome email');
      //   await this.mailer.SendWelcomeEmail(userRecord);
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async login(email, password) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    this.logger.debug('Checking password');

    const validPassword = await bcrypt.compare(password, userRecord.password);

    if (validPassword) {
      this.logger.debug('Password is valid!');
      this.logger.debug('Generating JWT');
      const token = this.generateToken(userRecord);
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      return { user, token };
    }
    throw new Error('Invalid email or password');
  }

  generateToken(userRecord) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 7);
    this.logger.debug(`Signing JWT for userId: ${userRecord._id}`);
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
