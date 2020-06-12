const { getUserLesson, extendLesson } = require('../../../src/datasource/redis/endpoints/userLessons');
const getLessonEndMoment = require('../../../src/helpers/getLessonEndMoment');

const UserNotInLesson = require('../../../src/helpers/errors/UserNotInLesson');

module.exports = async function extend(req) {
    const { userId } = req.accessToken;
    const userLesson = await getUserLesson(userId);
    if (!userLesson || userLesson.studentId !== userId) {
        throw new UserNotInLesson();
    }
    const { lessonId, tutorId, studentId, extendedAt } = userLesson;
    if (extendedAt) {
        return {
            result: {
                success: true,
            },
        };
    }
    const lesson = await this.app.models.Lesson.findById(lessonId);
    if (!lesson.startTime) {
        throw new UserNotInLesson();
    }
    const lessonExtendedAt = getLessonEndMoment(lesson.startTime, lesson.duration).unix();
    await extendLesson(tutorId, studentId, lessonExtendedAt);

    return {
        result: {
            success: true,
        },
    };
};
