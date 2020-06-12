const path = require('path');

const getIsFileExists = require('../../helpers/promise/isFileExists');
const scheduleProcessLessonVideo = require('../schedulers/processLessonVideoScheduler');
const getFileStat = require('../../helpers/promise/getFileStat');
const renameFile = require('../../helpers/promise/renameFilePromise');
const removeFile = require('../../helpers/promise/removeFilePromise');
const { scaleAndOverlayStudentOnTutorVideo } = require('../../helpers/renderVideo');
const storagePaths = require('../../datasource/storage/storagePaths');
const s3 = require('../../datasource/storage/s3Storage');

let processing = false;

module.exports = async function processLessonVideo(models, { lessonId }) {
    const {
        studentVideoPath,
        tutorVideoPath,
        basePath,
        resultVideoPath,
        renderOutputVideoPath,
        recordingUrl,
    } = storagePaths.getRecordingsPaths(lessonId);
    let newFileUrl;

    if (processing) {
        await scheduleProcessLessonVideo(models, lessonId, true);
        return;
    }
    const [tutorVideoValid, studentVideoValid] = await Promise.all([
        isFileValid(tutorVideoPath),
        isFileValid(studentVideoPath),
    ]);
    const resultFileAction = s3.isUsingS3() ? uploadRecordingToS3 : renameFile;
    if (tutorVideoValid && studentVideoValid) {
        processing = true;
        await scaleAndOverlayStudentOnTutorVideo(tutorVideoPath, studentVideoPath, renderOutputVideoPath);
        processing = false;

        [newFileUrl] = await Promise.all([
            resultFileAction(renderOutputVideoPath, resultVideoPath),
            removeFile(tutorVideoPath, { isLocal: true }),
            removeFile(studentVideoPath, { isLocal: true }),
        ]);
    } else {
        if (!tutorVideoValid && !studentVideoValid) return;
        const renameFileName = tutorVideoValid ? 'tutor.mp4' : 'student.mp4';
        newFileUrl = await resultFileAction(path.join(basePath, renameFileName), resultVideoPath);
    }
    await models.Lesson.updateAll({ id: lessonId }, {
        recordingPath: resultVideoPath,
        recordingUrl: s3.isUsingS3() ? newFileUrl : recordingUrl,
    });
};

async function uploadRecordingToS3(renderOutputVideoPath, resultVideoPath) {
    const newFileUrl = await s3.uploadRecording(renderOutputVideoPath, resultVideoPath);
    await removeFile(renderOutputVideoPath, { isLocal: true });

    return newFileUrl;
}

async function isFileValid(path) {
    const isFileExists = await getIsFileExists(path);
    if (!isFileExists) return false;
    const stats = await getFileStat(path);
    return !!stats.size;
}
