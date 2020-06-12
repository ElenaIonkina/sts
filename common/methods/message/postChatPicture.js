const _ = require('lodash');
const { getUserLesson } = require('../../../src/datasource/redis/endpoints/userLessons');
const PostChatPictureValidator = require('../../../src/helpers/validators/PostChatPictureValidator');
const BaseValidationError = require('../../../src/helpers/errors/validation/BaseValidationError');
const UserNotInLessonError = require('../../../src/helpers/errors/UserNotInLesson');
const saveImage = require('../../../src/helpers/files/saveImage');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const storagePaths = require('../../../src/datasource/storage/storagePaths');

const { sendMessage } = require('../../../socket/controllers/messages');

module.exports = async function postChatMessage(req, pci) {
    const [picture] = _.get(req, 'files.picture', null);
    if (!picture) {
        throw new BaseValidationError('picture');
    }
    const validationErr = PostChatPictureValidator(picture);
    if (validationErr) {
        throw validationErr;
    }
    await runMySQLTransactions(async (models) => {
        const user = await models.BaseUser.findById(_.get(req, 'accessToken.userId'));
        const currentLesson = await getUserLesson(user.id);
        if (!currentLesson) {
            throw new UserNotInLessonError();
        }
        const message = await models.Message.create({
            baseUserId: user.id,
            lessonId: currentLesson.lessonId,
        });
        const photosPath = storagePaths.getMessageUploadDirectory(currentLesson.lessonId, message.id);

        const sources = await saveImage(picture, photosPath, { withPreview: true });
        const photo = await models.Photo.create({
            originalPath: sources.original.getPath(),
            originalUrl: sources.original.getUrl(),
            previewPath: sources.preview.getPath(),
            previewUrl: sources.preview.getUrl(),
        });
        message.photoId = photo.id;

        await message.save();
        sendMessage({
            messageId: message.id,
            createdAt: message.createdOn,
            senderId: user.id,
            lessonId: currentLesson.lessonId,
            photo: {
                originalUrl: storagePaths.getPicturePath() +  photo.originalUrl,
                previewUrl: storagePaths.getPicturePath() + photo.previewUrl,
            },
        });
    });
    return {
        result: {
            success: true,
        },
    };
};
