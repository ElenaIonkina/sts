const UndefinedError = require('./UndefinedError');
const ERRORS = require('./../const/errors');

module.exports = class TutorBusyError extends UndefinedError {
    constructor() {
        super(409, ERRORS.tutorBusy);
    }
};
