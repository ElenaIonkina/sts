const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class InvalidState extends ValidationError {
    constructor() {
        super(ERRORS.validation.invalidState);
    }
};
