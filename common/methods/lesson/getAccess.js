const TokenNotFoundError = require('../../../src/helpers/errors/notFound/TokenNotFound');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleDeleteLessonSharing = require('../../../src/tasksScheduler/schedulers/deleteLessonSharingScheduler');
const getRequest = require('./getRequest');

module.exports = async function getAccess(req, token) {
    const shareToken = await this.app.models.ShareToken.findOne({ where: { token } });
    if (!shareToken) {
        throw new TokenNotFoundError();
    }

    const res = {};
    await runMySQLTransactions(async (models) => {
        const { userId } = req.accessToken;
        const lesson = await models.Lesson.findById(shareToken.lessonId);
        const bindGetRequest = getRequest.bind(this);
        if (lesson.baseUserId === userId) {
            res.lesson = await bindGetRequest(req, shareToken.lessonId);
            return;
        }
        const [sharedLesson, created] = await models.SharedLesson.findOrCreate({
            where: {
                lessonId: shareToken.lessonId,
                userId,
            },
        }, {
            lessonId: shareToken.lessonId,
            userId,
        });
        if (created) {
            await scheduleDeleteLessonSharing(models, [sharedLesson.id]);
        }
        res.lesson = await bindGetRequest(req, shareToken.lessonId);
    });
    return {
        ...res.lesson,
    };
};
