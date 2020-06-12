'use strict';

const logger = require('../../src/utils/logger');
const cookieParser = require('cookie');

module.exports = function () {
    return function handle(req, res, next) {
        const params = JSON.stringify(logger.cutLongParams(req.params));
        const query = JSON.stringify(logger.cutLongParams(req.query));
        const cookie = req.headers.cookie ? cookieParser.parse(req.headers.cookie) : { sessionId: '' };

        logger.info(`${req.method} ${req.originalUrl} \n\tparams: ${params} \n\tquery: ${query} \n\tsessionId: ${cookie.sessionId}`);
        next();
    };
};
