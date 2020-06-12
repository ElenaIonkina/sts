const AdminError = require('./AdminError');
const ERRORS = require('./../const/errors');

module.exports = class BlockAdminError extends AdminError {
    constructor() {
        super(ERRORS.admin.blockAdmin);
    }
};
