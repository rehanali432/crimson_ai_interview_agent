import logger from '../utils/logger.js';

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    method: req.method,
    path: req.path,
    status,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      status: 404,
    },
  });
}
