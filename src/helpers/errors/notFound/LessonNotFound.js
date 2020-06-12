const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class LessonNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.lessonNotFound);
    }
};
