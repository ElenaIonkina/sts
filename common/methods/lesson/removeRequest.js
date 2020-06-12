const app = require('../../../server/server');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const removeDirectory = require('../../../src/helpers/promise/removeFilePromise');

module.exports = async function (requestId) {
    const request = await app.models.Lesson.findById(requestId);
    if (request.type !== 'request') {
        return {
            success: false,
            message: 'This is not request',
        };
    }
    await removePhotos(request);
    await removeFriendsLessons(request);
    await request.destroy();
    return {
        success: true,
    };
};

const removePhotos = async (request) => {
    const lessonDir = storagePaths.getLessonUploadDirectory(request.id);
    try {
        await removeDirectory(lessonDir, { isDirectory: true });
    } catch (e) {
        console.error('e', e);
    }
    await request.lessonPhotos.destroyAll();
};

const removeFriendsLessons = async (request) => {
    await app.models.FriendsLessons.destroyAll({
        lessonId: request.id,
    });
};
