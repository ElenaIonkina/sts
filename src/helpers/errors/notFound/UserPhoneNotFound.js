const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class UserPhoneNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.userPhoneNotFound);
    }
};
