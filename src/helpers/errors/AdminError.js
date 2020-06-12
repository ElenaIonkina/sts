const UndefinedError = require('./UndefinedError');

module.exports = class AdminError extends UndefinedError {
    constructor(message) {
        super(403, message, 403);
    }
};
