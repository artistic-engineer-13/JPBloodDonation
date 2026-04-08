const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const env = require('./env');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
      serverSelectionTimeoutMS: 8000,
    });

    // Keep the connection log concise in production logs.
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Trying in-memory MongoDB fallback for quick local setup...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const memoryConnection = await mongoose.connect(memoryUri, {
        autoIndex: true,
      });

      console.log(`MongoDB in-memory connected: ${memoryConnection.connection.host}`);
      console.log('Data will reset when backend process stops.');
    } catch (memoryError) {
      console.error('In-memory MongoDB fallback failed:', memoryError.message);
      console.error('Check backend/.env MONGODB_URI and ensure MongoDB is running or Atlas is reachable.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
