const ERRORS = require('../const/errors');

module.exports = class UndefinedError {
    /**
     * @param {Number} [status = 500]
     * @param {String} [message =  serviceError]
     */
    constructor(status, message) {
        this.error = new Error();
        this.error.status = status || 500;
        this.error.message = message || ERRORS.serviceError;
    }

    getInstance() {
        return this.error;
    }
};
