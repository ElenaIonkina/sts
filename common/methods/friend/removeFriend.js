const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const FriendNotFound = require('../../../src/helpers/errors/notFound/FriendNotFound');

module.exports = async function removeFriend(req, friendId) {
    const { userId } = req.accessToken;
    const friend = await this.app.models.Friend.findOne({
        where: {
            friendId,
            userId,
        },
    });
    if (!friend) {
        throw new FriendNotFound();
    }

    const userLessons = await this.app.models.Lesson.find({
        where: {
            baseUserId: userId,
        },
    });
    const userLessonsIds = userLessons.map(l => l.id);
    await runMySQLTransactions(async (models) => {
        await Promise.all([
            models.Friend.destroyById(friend.id),
            models.FriendsLessons.destroyAll({
                lessonId: {
                    inq: userLessonsIds,
                },
                friendUserId: friendId,
            }),
        ]);
    });

    return {
        result: {
            success: true,
        },
    };
};
