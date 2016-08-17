/*jshint esversion: 6 */

const winston = require('winston');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(
      {'timestamp':true},
      {'colorize':true})
  ]
});

module.exports = logger;

logger.info('Logger initilization');
