const getSocketByBaseUserId = require('./getSocketByBaseUserId');

module.exports = function emitSocketByUserIdIfActive(userId, event, data) {
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) return;
    userSocket.emit(event, data);
};
