const storagePaths = require('../../../../src/datasource/storage/storagePaths');
const removeDir = require('../../../../src/helpers/promise/removeFilePromise');

module.exports = function deletePhotosOnRollback(ctx, next) {
    if (!ctx.instance || !ctx.options.transaction || !ctx.isNewInstance) return next();
    ctx.options.transaction.observe('after rollback', async (tctx, tnext) => {
        const photosPath = storagePaths.getLessonUploadDirectory(ctx.instance.id);
        await removeDir(photosPath, { isDirectory: true });
        tnext();
    });
    next();
};
