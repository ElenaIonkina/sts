const UndefinedError = require('../UndefinedError');

module.exports = class ValidationError extends UndefinedError {
    constructor(message) {
        super(422, message, 422);
    }
};
