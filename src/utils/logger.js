'use strict';

const winston = require('winston');
const dateFormat = require('dateformat');
const { getSlack } = require('./slack');

const logger = new winston.createLogger({
    transports: [
        new (winston.transports.File)({
            filename: 'errors.log',
            level: 'error',
        }),
        new winston.transports.Console({
            timestamp: function () {
                return dateFormat(new Date(), 'isoDateTime');
            },
            formatter: (options) => `[${options.timestamp()}] ${options.message}`,
        }),
    ],
    exitOnError: false,
});

logger.setLevels(winston.config.syslog.levels);
winston.addColors(winston.config.syslog.colors);

const LOG_INFO = 'info';
const LOG_DEBUG = 'debug';
const LOG_WARN = 'warn';
const LOG_ERROR = 'error';

const loggingLevels = [
    LOG_INFO,
    LOG_DEBUG,
    LOG_WARN,
    LOG_ERROR,
];
const exportedLogger = {};
loggingLevels.forEach((logLevel) => /**/ {
    exportedLogger[logLevel] = function (socket, message) {
        if (typeof (socket) === 'string') {
            logger.log(logLevel, socket);
        } else {
            logger.log(logLevel, `${message} \n\t`);
        }
        const slack = getSlack();
        if (!socket || !slack || logLevel === LOG_INFO) return;
        const slackMessage = `\n\t*Log ${logLevel} on ${slack.instanceName}*:\n\t${socket.message}` +
                             `\n\t*1.Stack*:\n\t${socket.stack}` +
                             `\n\t*2.Req data*:\n${JSON.stringify(socket.reqData, null, '	')}` +
                             `\n\t*3.Message*:\n\t${message}\n`;
        slack.send(slackMessage);
    };

    exportedLogger.cutLongParams = function (obj) {
        let result = {};
        if (!obj) return obj;
        try {
            Object.keys(obj).forEach(k => {
                if (typeof (obj[k]) === 'string') {
                    result[k] = obj[k].length > 50 ? obj[k].slice(0, 50) + '...' : obj[k];
                } else {
                    result[k] = obj[k];
                }
            });
        } catch (err) {
            console.error(err);
        }
        return result;
    };
});

module.exports = exportedLogger;
