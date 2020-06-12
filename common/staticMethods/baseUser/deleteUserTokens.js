/**
 * Deletes user access tokens and device tokens
 * @param {object} models - Transaction models argument
 * @param {number} deletingUserId - User id to delete tokens
 * @returns {Promise<void>}
 */
module.exports = async function deleteUserTokens(models, deletingUserId) {
    const accessTokens = await models.AccessToken.find({ where: { userId: deletingUserId } });
    const accessTokensIds = accessTokens.map(t => t.id);
    await Promise.all([
        models.AccessToken.destroyAll({ userId: deletingUserId }),
        models.DeviceToken.destroyAll({ accessTokenId: { inq: accessTokensIds } }),
    ]);
};
