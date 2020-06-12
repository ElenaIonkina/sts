const UndefinedError = require('../UndefinedError');

module.exports = class NotFoundError extends UndefinedError {
    constructor(message) {
        super(404, message, 404);
    }
};
