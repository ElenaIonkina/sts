const USER_STATUSES = require('../../../src/helpers/const/UserStatus');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound.js');

module.exports = async function unblock(id) {
    const unblockingUser = await this.app.models.BaseUser.findOne({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!unblockingUser) {
        throw new UserNotFoundError();
    }
    if (unblockingUser.userStatus !== USER_STATUSES.Active) {
        unblockingUser.userStatus = USER_STATUSES.Active;
        await unblockingUser.save();
    }
    return {
        success: true,
    };
};
