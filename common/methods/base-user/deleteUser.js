const moment = require('moment');
const USER_ROLES = require('../../../src/helpers/const/userRoles');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound.js');
const DeleteAdminError = require('../../../src/helpers/errors/DeleteAdminError.js');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const deleteUserTokens = require('../../staticMethods/baseUser/deleteUserTokens');
const clearTutorProposals = require('../../staticMethods/baseUser/clearTutorProposals');

module.exports = async function deleteUserById(req) {
    await runMySQLTransactions(async (models) => {
        const { userId } = req.accessToken;
        const deletingUser = await models.BaseUser.findOne({
            where: {
                id: userId,
                deletedAt: null,
            },
        });
        if (!deletingUser) {
            throw new UserNotFoundError();
        }
        if (deletingUser.role === USER_ROLES.ADMIN) {
            throw new DeleteAdminError();
        }
        deletingUser.deletedAt = moment().unix();
        await Promise.all([
            deletingUser.save(),
            models.Phone.destroyAll({ baseUserId: deletingUser.id }),
            deleteUserTokens(models, deletingUser.id),
            clearTutorProposals(models, deletingUser.id),
        ]);
    });

    return {
        success: true,
    };
};
