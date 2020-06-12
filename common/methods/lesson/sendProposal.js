const LessonTypes = require('../../../src/helpers/const/lessonTypes');
const { Accepted } = require('../../../src/helpers/const/TutorRequestStatus');
const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function sendProposal(req, lessonId) {
    const { userId } = req.accessToken;
    const [tutor, lesson] = await Promise.all([
        this.app.models.Tutor.findOne({ where: { baseUserId: userId } }),
        this.app.models.Lesson.findById(lessonId),
    ]);
    const isLessonAccessible = await getIsLessonAccessible(lesson, tutor, this.app.models);
    if (!isLessonAccessible) {
        throw new LessonNotFoundError();
    }

    await runMySQLTransactions(async (models) => {
        const proposal = await models.Proposal.findOne({
            where: {
                lessonId,
                tutorId: tutor.id,
            },
        });
        if (!proposal) {
            await lesson.proposals.add(tutor);
        }
    });
    return {
        success: true,
    };
};

async function getIsLessonAccessible(lesson, tutor, models) {
    if (!lesson || !tutor || tutor.status !== Accepted || lesson.type !== LessonTypes.REQUEST) {
        return false;
    }
    if (lesson.isPublic) return true;
    const lessonFriends = await models.FriendsLessons.find({ where: { lessonId: lesson.id } });
    if (!lessonFriends.length) {
        const baseUserFriends = await models.Friend.find({ where: { userId: lesson.baseUserId } });
        const userFriend = baseUserFriends.find(f => f.friendId === tutor.baseUserId);
        return !!userFriend;
    }
    return !!(lessonFriends.find(f => f.friendUserId === tutor.baseUserId));
}
