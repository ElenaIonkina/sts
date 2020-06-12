const { ADMIN } = require('../../../src/helpers/const/userRoles');

module.exports = async function fetchUsersCount() {
    const users = await this.app.models.BaseUser.find({
        where: {
            role: {
                neq: ADMIN,
            },
            deletedAt: null,
        },
    });
    const onlineUsers = users.filter(u => !u.lastSeenAt);
    return {
        totalUsers: users.length,
        totalOnlineUsers: onlineUsers.length,
    };
};
