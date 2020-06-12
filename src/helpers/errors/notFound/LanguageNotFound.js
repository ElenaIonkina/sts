const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class LanguageNotFoundError extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.languageNotFound);
    }
};
