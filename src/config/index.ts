import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

let databaseUrl = process.env.MONGODB_DEV_URI;
let baseURL = 'http://localhost:3000';
let testEnv = false;

if (process.env.NODE_ENV === 'test') {
  databaseUrl = process.env.MONGODB_TEST_URI;
  testEnv = true;
} else if (process.env.NODE_ENV === 'production') {
  databaseUrl = process.env.MONGODB_URI;
  baseURL = 'https://www.jobtrackify.com';
}

export default {
  baseURL,
  testEnv,
  port: process.env.PORT || 8000,
  databaseURL: databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  emailSecret: process.env.EMAIL_SECRET,
  emailHost: process.env.EMAIL_HOST,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  googleApiKey: process.env.GOOGLE_API_KEY,
  logs: {
    level: process.env.LOG_LEVEL,
  },
};
