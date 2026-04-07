const errorMiddleware = (err, req, res, next) => {
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${duplicatedField} already exists`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((value) => value.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Keep response safe: stack traces only in development.
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
