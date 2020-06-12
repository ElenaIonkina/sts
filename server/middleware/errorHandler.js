const logger = require('../../src/utils/logger');
const UndefinedError = require('../../src/helpers/errors/UndefinedError');

module.exports = function createErrorHandler() {
    return function sendAndLogError(err, req, res, next) {
        if (!err) next();
        const instanceErr = getInstance(err.backError || err);
        if (instanceErr.status >= 500) {
            logError(req, err.logError || err);
        }

        res.status(instanceErr.status).json({
            success: false,
            error: {
                message: instanceErr.message,
            },
        });
    };
};

function getInstance(err) {
    if (err.error && err.error.status && err.error.message) return err.error;
    if (err.statusCode && err.message) return { status: err.statusCode, message: err.message };
    if (err.status && err.message) return { status: err.status, message: err.message };
    return new UndefinedError();
}

function logError(req, error) {
    const files = getFilesFromReqWithoutBuffer(req);
    const logError = {
        stack: error.stack,
        message: error.message,
        reqData: {
            url: req.originalUrl,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
            headers: req.headers,
            body: req.body,
            files,
        },
    };
    logger.error(logError);
}

function getFilesFromReqWithoutBuffer(req) {
    if (!req.files) return null;
    return Object.keys(req.files).map(k => {
        const file = req.files[k];
        return file.map(f => {
            delete f.buffer;
            return f;
        });
    });
}
