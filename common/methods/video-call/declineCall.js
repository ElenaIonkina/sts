const getSocketByBaseUserId = require('../../../src/helpers/getSocketByBaseUserId');

const { sendDeclineCallEvent } = require('../../../socket/controllers/calls');
const { getCallRequest, dropCallRequest } = require('../../../src/datasource/redis/endpoints/callRequests');

const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const UserSocketNotFound = require('../../../src/helpers/errors/notFound/UserSocketNotFound');

module.exports = async function declineCall(req, lessonId) {
    const { userId } = req.accessToken;
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) {
        throw new UserSocketNotFound();
    }

    const callRequest = await getCallRequest(lessonId);
    if (!callRequest || callRequest.tutorId !== userId) {
        throw new LessonNotFoundError();
    }

    sendDeclineCallEvent({
        lessonId,
        tutorId: callRequest.tutorId,
        studentId: callRequest.studentId,
    });

    await dropCallRequest(lessonId);

    return {
        result: {
            success: true,
        },
    };
};
