const AdminError = require('./AdminError');
const ERRORS = require('./../const/errors');

module.exports = class DeleteAdminError extends AdminError {
    constructor() {
        super(ERRORS.admin.deleteAdmin);
    }
};
