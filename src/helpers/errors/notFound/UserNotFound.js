const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class UserNotFoundError extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.userNotFound);
    }
};
