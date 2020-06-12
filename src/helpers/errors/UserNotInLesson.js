const UndefinedError = require('./UndefinedError');
const ERRORS = require('./../const/errors');

module.exports = class UserNotInLesson extends UndefinedError {
    constructor() {
        super(400, ERRORS.userNotInLesson);
    }
};
