const UndefinedError = require('./UndefinedError');

class AuthorizedError extends UndefinedError {
    constructor(message) {
        super(401, message, 401);
    }

    getInstance() {
        return this.error;
    }
}

/**
 * @type {UndefinedError}
 */
module.exports = AuthorizedError;
