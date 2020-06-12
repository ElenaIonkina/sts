module.exports = async function isTokenValid(token) {
    const app = require('../../src/helpers/getApp')();
    if (!token) {
        return false;
    }
    const tokenModel = await app.models.AccessToken.findById(token);
    return {
        valid: Boolean(tokenModel),
        userId: tokenModel ? tokenModel.userId : undefined,
    };
};
