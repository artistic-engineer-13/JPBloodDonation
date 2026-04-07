const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const corsMiddleware = require('./config/cors');
const apiRateLimiter = require('./middlewares/rateLimit.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

// Security headers.
app.use(helmet());

// CORS policy.
app.use(corsMiddleware);

// Request logs.
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Global rate limiter.
app.use(apiRateLimiter);

// Request body parsing.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Base API routes.
app.use('/api', routes);
app.use('/api/v1', routes);

// 404 and error pipeline.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
