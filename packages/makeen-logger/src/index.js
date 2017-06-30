import Joi from 'joi';
import { Module } from 'makeen';
import path from 'path';
import { Logger, transports as loggerTransports } from 'winston';

class LoggerModule extends Module {
  static configSchema = {
    logsDir: Joi.string().required(),
  };
  name = 'logger';

  initialize({ logsDir }) {
    this.logger = new Logger({
      transports: [
        new loggerTransports.Console({
          colorize: true,
        }),
        new loggerTransports.File({
          filename: path.join(logsDir, 'logs.log'),
          level: 'error',
          handleExceptions: true,
          humanReadableUnhandledException: true,
        }),
      ],
    });
  }

  setup() {
    const { logger } = this;

    this.export({ log: logger });
  }
}

export { LoggerModule as default };
