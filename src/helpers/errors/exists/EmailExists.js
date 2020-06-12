const ExistsError = require('./ExistsError');
const ERRORS = require('../../const/errors');

module.exports = class EmailExists extends ExistsError {
    constructor() {
        super(ERRORS.exists.emailExists);
    }
};
