const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class CardNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.cardNotFound);
    }
};
