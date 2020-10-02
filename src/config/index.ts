import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

let databaseUrl = process.env.MONGODB_DEV_URI;
if (process.env.NODE_ENV === 'test') {
  databaseUrl = process.env.MONGODB_TEST_URI;
} else if (process.env.NODE_ENV === 'production') {
  databaseUrl = process.env.MONGODB_URI;
}

export default {
  port: process.env.PORT || 8000,
  databaseURL: databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  logs: {
    level: process.env.LOG_LEVEL,
  },
};
