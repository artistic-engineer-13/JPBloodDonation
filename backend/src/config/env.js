const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || '*',
  rateLimitWindowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

if (!env.mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables');
}

if (!env.jwtSecret) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

module.exports = env;
