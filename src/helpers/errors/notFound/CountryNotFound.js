const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class CountryNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.countryNotFound);
    }
};
