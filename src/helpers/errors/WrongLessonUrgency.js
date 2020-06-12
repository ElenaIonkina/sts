const UndefinedError = require('./UndefinedError');
const ERRORS = require('./../const/errors');

module.exports = class WrongLessonUrgency extends UndefinedError {
    constructor() {
        super(400, ERRORS.wrongLessonUrgency, 400);
    }
};
