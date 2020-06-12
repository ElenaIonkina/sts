const validate = require('validate.js');
const BaseValidationError = require('../errors/validation/BaseValidationError');

module.exports = function validateSignUpData(data, constraints) {
    const validationRes = validate(data, constraints);
    if (validationRes) {
        return new BaseValidationError(Object.keys(validationRes));
    }
    return null;
};
