const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class InvalidPhoneError extends ValidationError {
    constructor() {
        super(ERRORS.validation.invalidPhone);
    }
};
