const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class BaseValidationErrors extends ValidationError {
    constructor(properties) {
        super(`${ERRORS.validation.baseValidation}(${properties})`);
    }
};
