const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const USER_ROLES = require('../../../src/helpers/const/userRoles');
const USER_STATUS = require('../../../src/helpers/const/UserStatus');

const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');

module.exports = async function addFriend(req, friendId) {
    const { userId } = req.accessToken;
    const friend = await this.app.models.BaseUser.findById(friendId);
    const isFriendNotFound = isFriendValid(friend, userId);
    if (isFriendNotFound) {
        throw new UserNotFoundError();
    }

    await runMySQLTransactions(async (models) => {
        await models.Friend.findOrCreate({
            where: {
                userId,
                friendId: friend.id,
            },
        }, {
            userId,
            friendId: friend.id,
        });
    });

    return {
        result: {
            success: true,
        },
    };
};

function isFriendValid(friend, userId) {
    return !friend || friend.role !== USER_ROLES.TUTOR || friend.id === userId ||
        friend.deletedAt || friend.userStatus === USER_STATUS.Blocked;
}
