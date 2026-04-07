const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized: token not provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, 'Unauthorized: invalid or expired token');
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Unauthorized: user not found or inactive');
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
