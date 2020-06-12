class AbstractValidationError {
    constructor() {
        this.error = new Error();
        this.error.status = 422;
        this.error.message = 'ValidationError';
        this.error.details = {
            messages: {},
        };
    }

    add(field, message) {
        if (!this.error.details.messages[field]) {
            this.error.details.messages[field] = [];
        }
        this.error.details.messages[field].push(message);
    }

    get(field) {
        return this.error.details.messages[field];
    }

    getInstance() {
        return this.error;
    }

    hasErrors() {
        return Boolean(Object.keys(this.error.details.messages).length);
    }
}

/**
 * @type {AbstractValidationError}
 */
module.exports = AbstractValidationError;
