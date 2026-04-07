const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
    });

    // Keep the connection log concise in production logs.
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
