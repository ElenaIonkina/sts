const _ = require('lodash');
const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');

const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

const { sendMessage } = require('../../../socket/controllers/messages');

module.exports = async function postChatMessage(req, message) {
    const user = await this.app.models.BaseUser.findById(_.get(req, 'accessToken.userId'));
    const currentLesson = await getUserLesson(user.id);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }
    const messageModel = await this.app.models.Message.create({
        baseUserId: user.id,
        lessonId: currentLesson.lessonId,
        text: message,
    });
    sendMessage({
        messageId: messageModel.id,
        createdAt: messageModel.createdOn,
        message,
        senderId: user.id,
        lessonId: currentLesson.lessonId,
    });
    return {
        result: {
            success: true,
        },
    };
};
