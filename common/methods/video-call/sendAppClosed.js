const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

const { sendAppClosedEvent } = require('../../../socket/controllers/calls');

module.exports = async function sendAppClosed(req, isClosed) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }
    const opponentId = userId === currentLesson.studentId ? currentLesson.tutorId : currentLesson.studentId;
    sendAppClosedEvent(isClosed, opponentId);
    return {
        result: {
            success: true,
        },
    };
};
