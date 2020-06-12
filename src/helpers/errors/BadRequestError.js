const UndefinedError = require('./UndefinedError');

/**
 * @type {UndefinedError}
 */
module.exports = new UndefinedError(400, 'errors.badRequest');
