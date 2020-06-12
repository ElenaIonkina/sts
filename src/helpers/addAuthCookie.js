/**
 * @param {Object} res
 * @param {Object} token
 * @param {Object} options
 */
module.exports = function addAuthCookie(res, token, options = { key: 'access_token' }) {
    res.cookie(options.key, token.id, {
        signed: true,
        httpOnly: true,
        expires: 0,
    });
};
