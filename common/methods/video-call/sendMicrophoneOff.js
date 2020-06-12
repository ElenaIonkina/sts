const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

const { sendMicrophoneOffEvent } = require('../../../socket/controllers/calls');

module.exports = async function sendMicrophoneOff(req, isOff) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }
    const opponentId = userId === currentLesson.studentId ? currentLesson.tutorId : currentLesson.studentId;
    sendMicrophoneOffEvent(isOff, opponentId);
    return {
        result: {
            success: true,
        },
    };
};
