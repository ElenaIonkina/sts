const UndefinedError = require('./UndefinedError');
const ERRORS = require('./../const/errors');

module.exports = class WrongSmsCode extends UndefinedError {
    constructor() {
        super(400, ERRORS.wrongSmsCode);
    }
};
