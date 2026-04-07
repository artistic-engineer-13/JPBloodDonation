const ApiError = require('../utils/ApiError');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden: insufficient permissions');
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
