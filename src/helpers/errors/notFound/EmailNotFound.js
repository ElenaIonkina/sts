const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class EmailNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.emailNotFound);
    }
};
