const getSocketsInRoom = require('../../src/helpers/getSocketsInRoom');

const MessageType = require('../../src/helpers/const/MessageTypes');

function sendMessage({ lessonId, senderId, messageId, createdAt, message, photo }) {
    const receiverSocket = getSocketsInRoom(lessonId).find(socket => socket.userId !== senderId);
    const timestamp = Math.floor(createdAt.getTime() / 1000);
    const messageObject = {
        id: messageId,
        createdAt,
        timestamp,
    };
    if (message) {
        messageObject.text = message;
        messageObject.type = MessageType.MESSAGE;
    } else {
        messageObject.photo = photo;
        messageObject.type = MessageType.PICTURE;
    }
    receiverSocket.emit('messages:new', messageObject);
}

module.exports = { sendMessage };

