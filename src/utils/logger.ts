// src/utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error';

const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  log: (level: LogLevel, message: string, ...args: any[]) => {
    switch (level) {
      case 'info':
        logger.info(message, ...args);
        break;
      case 'warn':
        logger.warn(message, ...args);
        break;
      case 'error':
        logger.error(message, ...args);
        break;
    }
  }
};

export default logger;