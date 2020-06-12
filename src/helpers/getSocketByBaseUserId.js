module.exports = function getSocketByBaseUserId(baseUserId) {
    const { io } = require('../../socket');
    return Object.values(io.sockets.connected).find(s => s.userId === baseUserId);
};
