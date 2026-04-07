const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  limit: env.rateLimitMaxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

module.exports = apiRateLimiter;
