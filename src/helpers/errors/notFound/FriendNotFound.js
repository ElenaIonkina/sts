const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class FriendNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.friendNotFound);
    }
};
