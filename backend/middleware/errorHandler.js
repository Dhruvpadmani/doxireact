// Standardized error response function
const createErrorResponse = (res, statusCode, message, code = null, additionalData = {}) => {
  const response = {
    message,
    ...additionalData
  };
  
  if (code) {
    response.code = code;
  }
  
  // Only include error details in development mode
  if (process.env.NODE_ENV === 'development') {
    response.timestamp = new Date().toISOString();
  }
  
  return res.status(statusCode).json(response);
};

// Standardized success response function
const createSuccessResponse = (res, data, message = null) => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(200).json(response);
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ENTRY';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
    code = 'FILE_TOO_LARGE';
  }

  return createErrorResponse(res, statusCode, message, code, {
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  createErrorResponse,
  createSuccessResponse,
  errorHandler
};