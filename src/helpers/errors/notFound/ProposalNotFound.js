const NotFoundError = require('./NotFoundError');
const ERRORS = require('../../const/errors');

module.exports = class ProposalNotFound extends NotFoundError {
    constructor() {
        super(ERRORS.notFound.proposalNotFound);
    }
};
