const mongoose = require('mongoose');
const env = require('./env');

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
    console.error('Check backend/.env MONGODB_URI and ensure MongoDB is running or Atlas is reachable.');
    process.exit(1);
  }
};

module.exports = connectDB;
