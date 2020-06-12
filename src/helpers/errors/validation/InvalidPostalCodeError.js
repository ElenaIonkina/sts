const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class InvalidPostalCode extends ValidationError {
    constructor() {
        super(ERRORS.validation.invalidPostalCode);
    }
};
