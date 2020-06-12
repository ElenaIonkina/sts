const UndefinedError = require('./UndefinedError');
const ERRORS = require('./../const/errors');

module.exports = class UserBlockedError extends UndefinedError {
    constructor() {
        super(403, ERRORS.userBlocked, 403);
    }
};
