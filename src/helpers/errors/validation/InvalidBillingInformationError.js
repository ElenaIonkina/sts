const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class InvalidBillingInformation extends ValidationError {
    constructor() {
        super(ERRORS.validation.invalidBillingInformation);
    }
};
