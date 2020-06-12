const ValidationError = require('./ValidationError');
const ERRORS = require('../../const/errors');

module.exports = class InvalidUpdateData extends ValidationError {
    constructor() {
        super(ERRORS.validation.invalidUpdateData);
    }
};
