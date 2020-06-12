const UndefinedError = require('../UndefinedError');

module.exports = class ExistsError extends UndefinedError {
    constructor(message) {
        super(409, message);
    }
};
