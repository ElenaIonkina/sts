const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');
const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');

module.exports = async function getCredentials(req) {
    const { userId } = req.accessToken;
    const currentLesson = await getUserLesson(userId);
    if (!currentLesson) {
        throw new UserNotInLessonError();
    }

    return {
        result: {
            turn: {
                ip: this.app.get('turnIp'),
                port: this.app.get('turnPort'),
                pass: this.app.get('turnPass'),
                user: this.app.get('turnLogin'),
            },
            stun: {
                ip: this.app.get('stunIp'),
                port: this.app.get('stunPort'),
            },
        },
    };
};
