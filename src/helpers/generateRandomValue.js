const crypto = require('crypto');

/**
 * Generate random value
 * @param {Number} length - must be even
 * @returns {String}
 */
module.exports = function generateRandomValue(length = 8) {
    return crypto.randomBytes(Math.round(length / 2)).toString('hex');
};
