const moment = require('moment');
const addRoutes = require('../routes');
const isTokenValid = require('../../src/helpers/isTokenValid');
const endCall = require('../../common/methods/video-call/endCall');
const getSocketByBaseUserId = require('../../src/helpers/getSocketByBaseUserId');
const { sendDeferredEvents } = require('./deferredEvents');
const { getUserLesson } = require('./../../src/datasource/redis/endpoints/userLessons');
const { dropUserCallRequests } = require('../../src/datasource/redis/endpoints/callRequests');
const { dropCall } = require('./calls');

const { FREE } = require('../../src/helpers/const/SocketStatus');

const USER_LEFT_EVENT = 'calls:user:left';

module.exports = function init(io, app) {
    io.on('connection', async (socket) => {
        const { token } = socket.handshake.query;
        const { valid, userId } = await isTokenValid(token);
        if (!valid) {
            dropSocketWithEvent(socket, 'login:failed', { message: 'Invalid Token' });
            return;
        }
        const connectedSocket = getSocketByBaseUserId(userId);
        if (connectedSocket) {
            dropSocketWithEvent(connectedSocket, 'login:new', { message: 'New active connection' });
        }
        socket.app = app;
        await initSocket(socket, userId);
        socket.emit('login:success', { message: 'Success connection' });
        addRoutes(socket);
        await sendDeferredEvents(socket);
    });
};

async function initSocket(socket, userId) {
    socket.userId = userId;
    socket.status = FREE;
    await setUserOnline(socket);
    socket.on('disconnect', async () => {
        const [userLesson] = await Promise.all([
            getUserLesson(userId),
        ]);
        await Promise.all([
            dropUserCallRequests(userId),
            setUserOffline(socket),
        ]);
        if (!userLesson) return;

        const { extendedAt, lessonId, tutorId, studentId } = userLesson;
        const opponentId = tutorId === userId ? studentId : tutorId;
        const receiverSocket = getSocketByBaseUserId(opponentId);
        await endCall(socket.app.models, lessonId, extendedAt, Boolean(receiverSocket));

        if (receiverSocket) {
            receiverSocket.status = FREE;
            receiverSocket.emit(USER_LEFT_EVENT, { lessonId });
        }

        await dropCall(lessonId, opponentId, userId);
    });
}

function setUserOnline(socket) {
    return socket.app.models.BaseUser.updateAll({
        id: socket.userId,
    }, {
        lastSeenAt: null,
    });
}

function setUserOffline(socket) {
    const now = moment().unix();
    return socket.app.models.BaseUser.updateAll({
        id: socket.userId,
    }, {
        lastSeenAt: now,
    });
}

function dropSocketWithEvent(socket, event, data) {
    socket.emit(event, data);
    socket.disconnect();
}
