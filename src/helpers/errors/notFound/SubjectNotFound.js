const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class SubjectNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.subjectNotFound);
    }
};
