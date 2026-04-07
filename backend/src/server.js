const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port} in ${env.nodeEnv} mode`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();
