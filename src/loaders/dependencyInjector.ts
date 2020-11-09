import { Container } from 'typedi';
import Logger from '../logger';
import nodemailer from 'nodemailer';
import config from '../config';

export default (): void => {
  try {
    Container.set('logger', Logger);
    Container.set(
      'transporter',
      nodemailer.createTransport(
        {
          host: config.emailHost,
          port: 587,
          auth: {
            user: config.emailUser,
            pass: config.emailPass,
          },
        },
        { secure: true }
      )
    );
  } catch (e) {
    Logger.error('Error on dependency injector loader: %o', e);
    throw e;
  }
};
