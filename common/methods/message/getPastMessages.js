const moment = require('moment');
const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const { PICTURE, MESSAGE } = require('../../../src/helpers/const/MessageTypes');

module.exports = async function getPastMessage(req, lessonId) {
    const { userId } = req.accessToken;
    const messagesJson = await getMessagesIfAccessible(this.app.models, lessonId, userId);
    if (!messagesJson) throw new LessonNotFoundError();

    const messagesDto = toDto(messagesJson);

    return {
        result: {
            messages: messagesDto,
        },
    };
};

async function getMessagesIfAccessible(models, lessonId, userId) {
    const lesson = await models.Lesson.findById(lessonId, {
        include: {
            relation: 'messages',
            scope: {
                include: 'photo',
            },
        },
    });
    if (!lesson) return null;
    const messagesJson = lesson.messages().map(m => m.toJSON());
    if (lesson.baseUserId === userId || lesson.isPublic) return messagesJson;

    const sharedLessons = await models.SharedLesson.find({ where: { lessonId } });
    const sharedUser = sharedLessons.find(s => s.userId === userId);
    if (sharedUser) return messagesJson;

    const lessonFriends = await models.FriendsLessons.find({ where: { lessonId } });
    if (!lessonFriends.length) return messagesJson;

    const lessonFriend = lessonFriends.find(l => l.friendId === userId);
    if (lessonFriend) return messagesJson;
}

function toDto(messages) {
    return messages.map(m => {
        const typeProps = getTypeProps(m);
        const timestamp = moment(m.createdOn).unix();
        return {
            ...typeProps,
            timestamp,
            id: m.id,
            createdAt: m.createdOn,
            baseUserId: m.baseUserId,
        };
    });
}

function getTypeProps(message) {
    if (message.text)
        return {
            type: MESSAGE,
            text: message.text,
        };

    const { originalUrl, previewUrl } = message.photo;
    return {
        type: PICTURE,
        photo: {
            originalUrl,
            previewUrl,
        },
    };
}
