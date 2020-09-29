import Logger from '../logger';
import {
  Connection,
  createConnection,
  getConnectionOptions,
  useContainer,
} from 'typeorm';
import { Container } from 'typedi';

export default async (connectionName: string): Promise<Connection> => {
  useContainer(Container);
  try {
    const options = await getConnectionOptions(connectionName);
    return await createConnection({ ...options, name: 'default' });
  } catch (err) {
    Logger.debug(err);
    throw err;
  }
};
