const jwt = require('jsonwebtoken');

const env = require('../config/env');

const signAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const authResponse = (user) => {
  return {
    user: user.toSafeObject(),
    token: signAccessToken(user),
  };
};

module.exports = {
  signAccessToken,
  authResponse,
};
