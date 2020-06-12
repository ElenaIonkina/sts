const ExistsError = require('./ExistsError');
const ERRORS = require('../../const/errors');

module.exports = class UserExists extends ExistsError {
    constructor() {
        super(ERRORS.exists.usersExists);
    }
};
