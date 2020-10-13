import { LeveledLogMethod } from 'winston';
import Logger from '../../../src/logger';
const LoggerMock = Logger;
LoggerMock.debug = jest.fn();
LoggerMock.info = jest.fn();
LoggerMock.warn = jest.fn();
LoggerMock.error = jest.fn();
export default LoggerMock;
