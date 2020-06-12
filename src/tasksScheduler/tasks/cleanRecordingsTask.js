const storagePaths = require('../../datasource/storage/storagePaths');
const removeDirectory = require('../../helpers/promise/removeFilePromise');
const scheduleCleanRecordings = require('../schedulers/cleanRecordingsScheduler');

module.exports = async function cleanRecordings(models) {
    const recordingsRoot = storagePaths.getRootRecordingsDirectory();
    await removeDirectory(recordingsRoot, { isDirectory: true });
    await models.Lesson.updateAll({}, {
        recordingPath: null,
        recordingUrl: null,
    });
    await scheduleCleanRecordings(models);
};
