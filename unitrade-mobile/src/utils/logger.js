/**
 * Logger utility - Only logs in development mode
 * Prevents console.log performance issues in production
 */

export const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },
};

export default logger;
