const { getDeferredEvents, dropDeferredEvents, addDeferredEvent } = require('../../src/datasource/redis/endpoints/deferredEvents');
const { getUserLesson } = require('../../src/datasource/redis/endpoints/userLessons');
const getSocketByBaseUserId = require('../../src/helpers/getSocketByBaseUserId');
const getSocketsInRoom = require('../../src/helpers/getSocketsInRoom');

async function sendDeferredEvents(socket) {
    const deferredEvents = await getDeferredEvents(socket.userId);
    deferredEvents.forEach(e => socket.emit(e.event, e.data));
    await dropDeferredEvents(socket.userId);
}

async function emitOrDefer({ event, data, senderUserId, dieTime, receiverUserId, lessonId }) {
    const receiverSocket = getSocketByUserIdOrLessonIdAndSenderId(receiverUserId, lessonId, senderUserId);
    if (receiverSocket) {
        receiverSocket.emit(event, data);
        return;
    }
    if (!receiverUserId) {
        const lesson = await getUserLesson(senderUserId);
        receiverUserId = lesson.studentId === senderUserId ? lesson.tutorId : lesson.tutorId;
    }
    await addDeferredEvent(receiverUserId, event, data, dieTime, senderUserId);
}

function getSocketByUserIdOrLessonIdAndSenderId(receiverUserId, lessonId, senderUserId) {
    if (receiverUserId) {
        return getSocketByBaseUserId(receiverUserId);
    }
    if (lessonId && senderUserId) {
        return getSocketsInRoom(lessonId).find(socket => socket.userId !== senderUserId);
    }
    return null;
}

module.exports = {
    sendDeferredEvents,
    emitOrDefer,
};
