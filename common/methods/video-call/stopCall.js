const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const { sendStopCallEvent } = require('../../../socket/controllers/calls');
const scheduleProcessLessonVideo = require('../../../src/tasksScheduler/schedulers/processLessonVideoScheduler');
const schedulePayLesson = require('../../../src/tasksScheduler/schedulers/payLessonScheduler');

const UserNotInLesson = require('../../../src/helpers/errors/UserNotInLesson');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function stopCall(req) {
    const { userId } = req.accessToken;
    const userLesson = await getUserLesson(userId);
    if (!userLesson) {
        throw new UserNotInLesson();
    }
    const { lessonId, extendedAt } = userLesson;
    await runMySQLTransactions(async (models) => {
        const lesson = await models.Lesson.findById(lessonId);
        lesson.finished = true;
        const receiverId = userLesson.studentId === userId ? userLesson.tutorId : userLesson.studentId;
        await Promise.all([
            models.Proposal.destroyAll({ lessonId }),
            lesson.save(),
            schedulePayLesson(models, lesson, extendedAt, false),
            sendStopCallEvent(lessonId, userId, receiverId),
            scheduleProcessLessonVideo(models, lessonId),
        ]);
    });

    return {
        result: {
            success: true,
        },
    };
};
