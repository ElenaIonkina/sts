const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class SelectedTutorNotfound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.selectedTutorNotFound);
    }
};
