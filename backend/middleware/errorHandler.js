const errorHandler = (err, req, res, next) => {
  console.error('[API ERROR]:', req.method, req.originalUrl, err.name, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found or invalid ID format';
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size cannot exceed 5MB';
  }

  // Multer file count error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Too many files uploaded';
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : undefined
  });
};

module.exports = errorHandler;
