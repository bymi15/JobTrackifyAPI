import Logger from '../logger';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typedi';

export default async (): Promise<void> => {
  useContainer(Container);
  try {
    await createConnection();
  } catch (err) {
    Logger.debug(err);
  }
};
