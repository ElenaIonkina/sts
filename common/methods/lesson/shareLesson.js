const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleDeleteLessonSharing = require('../../../src/tasksScheduler/schedulers/deleteLessonSharingScheduler');

module.exports = async function shareLesson(req, lessonId, users) {
    const { userId } = req.accessToken;
    const uniqueUsers = [...(new Set(users.filter(u => u !== userId)))];

    const validationErr = await validateAndGetError(userId, lessonId, uniqueUsers, this.app.models);
    if (validationErr) {
        throw validationErr;
    }

    await runMySQLTransactions(async (models) => {
        await models.SharedLesson.destroyAll({
            lessonId,
        });
        const sharedLessons = await Promise.all(uniqueUsers.map(u => models.SharedLesson.create({
            lessonId,
            userId: u,
        })));
        const sharedLessonsIds = sharedLessons.map(s => s.id);
        await scheduleDeleteLessonSharing(models, sharedLessonsIds);
    });

    return {
        result: {
            success: true,
        },
    };
};

async function validateAndGetError(userId, lessonId, users, models) {
    const lesson = await models.Lesson.findOne({
        where: {
            id: lessonId,
            baseUserId: userId,
        },
    });
    if (!lesson) {
        return new LessonNotFoundError();
    }

    const validUsers = await models.BaseUser.find({
        where: {
            id: {
                inq: users,
            },
        },
    });
    if (validUsers.length !== users.length) {
        return new UserNotFoundError();
    }
}
