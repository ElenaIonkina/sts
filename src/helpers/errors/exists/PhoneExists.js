const ExistsError = require('./ExistsError');
const ERRORS = require('../../const/errors');

module.exports = class PhoneExists extends ExistsError {
    constructor() {
        super(ERRORS.exists.phoneExists);
    }
};
