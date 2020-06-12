const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const { addCandidate } = require('../../../socket/controllers/calls');

module.exports = async function sendCandidate(req, sdpMid, sdpMLineIndex, candidate) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    await addCandidate(currentLesson && currentLesson.lessonId, {
        candidate,
        sdpMid,
        sdpMLineIndex,
    }, userId, currentLesson && currentLesson.role);
    return {
        result: {
            success: true,
        },
    };
};
