const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

const { sendOfferEvent } = require('../../../socket/controllers/calls');

module.exports = async function sendOffer(req, offer) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }
    const opponentId = currentLesson.studentId === userId ? currentLesson.tutorId : currentLesson.studentId;
    sendOfferEvent({
        lessonId: currentLesson.lessonId,
        offer,
        userId,
        role: currentLesson.role,
        opponentId,
    });
    return {
        result: {
            success: true,
        },
    };
};
