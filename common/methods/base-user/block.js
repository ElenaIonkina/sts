const USER_ROLES = require('../../../src/helpers/const/userRoles');
const USER_STATUSES = require('../../../src/helpers/const/UserStatus');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound.js');
const BlockAdminError = require('../../../src/helpers/errors/BlockAdminError.js');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const deleteUserTokens = require('../../staticMethods/baseUser/deleteUserTokens');
const clearTutorProposals = require('../../staticMethods/baseUser/clearTutorProposals');

module.exports = async function block(id) {
    await runMySQLTransactions(async (models) => {
        const blockingUser = await models.BaseUser.findOne({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!blockingUser) {
            throw new UserNotFoundError();
        }
        if (blockingUser.role === USER_ROLES.ADMIN) {
            throw new BlockAdminError();
        }
        if (blockingUser.userStatus === USER_STATUSES.Blocked) return;

        blockingUser.userStatus = USER_STATUSES.Blocked;

        await Promise.all([
            blockingUser.save(),
            deleteUserTokens(models, blockingUser.id),
            clearTutorProposals(models, blockingUser.id),
        ]);
    });
    return {
        success: true,
    };
};
