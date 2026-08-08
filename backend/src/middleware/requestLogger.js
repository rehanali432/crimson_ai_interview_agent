import logger from '../utils/logger.js';

/**
 * Request logging middleware.
 * Logs method, path, status, and response time for every request.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
