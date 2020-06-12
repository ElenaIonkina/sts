const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

const { sendCameraOffEvent } = require('../../../socket/controllers/calls');

module.exports = async function sendCameraOff(req, isOff) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }
    const opponentId = userId === currentLesson.studentId ? currentLesson.tutorId : currentLesson.studentId;
    sendCameraOffEvent(isOff, opponentId);
    return {
        result: {
            success: true,
        },
    };
};
