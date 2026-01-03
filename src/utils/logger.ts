import pino from 'pino';
import { getConfig } from '../config/index.js';

let loggerInstance: pino.Logger | null = null;

export function getLogger(name?: string): pino.Logger {
  if (loggerInstance) {
    return name ? loggerInstance.child({ module: name }) : loggerInstance;
  }

  const config = getConfig();
  
  loggerInstance = pino({
    level: config.LOG_LEVEL,
    ...(config.LOG_PRETTY && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }),
  });

  return name ? loggerInstance.child({ module: name }) : loggerInstance;
}
