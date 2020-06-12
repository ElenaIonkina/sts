const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class UserSocketNotfound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.userSocketNotFound);
    }
};
