const _ = require('lodash');

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function logout(req) {
    const accessTokenId = _.get(req, 'accessToken.id', null);
    if (!accessTokenId) {
        return {
            result: {
                success: false,
            },
        };
    }
    await runMySQLTransactions(async (models) => {
        await Promise.all([
            models.AccessToken.destroyAll({ id: accessTokenId }),
            models.DeviceToken.destroyAll({ accessTokenId }),
        ]);
    });

    return {
        result: {
            success: true,
        },
    };
};
