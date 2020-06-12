module.exports = function getSocketsInRoom(roomId) {
    const { io } = require('../../socket/index');
    const room = io.sockets.adapter.rooms[roomId];
    return room ? Object.keys(room.sockets).map(id => io.sockets.connected[id]) : [];
};
