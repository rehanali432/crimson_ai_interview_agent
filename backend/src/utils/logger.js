import config from './config.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = config.isDev ? LOG_LEVELS.debug : LOG_LEVELS.info;

/**
 * Structured logger with timestamp and level filtering.
 * In production, only info/warn/error are emitted.
 */
const logger = {
  error(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }));
    }
  },

  warn(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }));
    }
  },

  info(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }));
    }
  },

  debug(message, meta = {}) {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }));
    }
  },
};

export default logger;
