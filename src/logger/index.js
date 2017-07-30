import winston from 'winston';
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(
      {'timestamp':true},
      {'colorize':true})
  ]
});

module.exports = logger;

logger.info('Logger initilization');
