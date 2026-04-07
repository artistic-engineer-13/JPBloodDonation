const cors = require('cors');
const env = require('./env');

const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim());

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server calls and tools like Postman without origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy blocked this origin'));
  },
  credentials: true,
};

module.exports = cors(corsOptions);
