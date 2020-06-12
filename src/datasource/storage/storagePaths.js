const path = require('path');
const generateRandomValue = require('../../helpers/generateRandomValue');
const isUsingS3 = process.env.IS_USING_S3;
const siteHost = process.env.WEB_CLIENT_URL;

class StoragePaths {
    constructor() {
        this._app = null;
    }

    getRootDirectory() {
        return this.app.get('storageFilesPath');
    }

    getRootRecordingsDirectory() {
        return this.app.get('storageRecordingsPath');
    }

    getUploadDirectory() {
        return path.join(this.getRootDirectory(), 'uploads');
    }
    getPicturePath() {
        return isUsingS3 ? '' : siteHost;
    }

    /**
     * @param {Number} [userId]
     * @returns {String}
     */
    getUserUploadDirectory(userId) {
        if (!userId) {
            return this.getUploadDirectory();
        }

        return path.join(this.getUploadDirectory(), userId.toString());
    }

    /**
     * @param {Number} [lessonId]
     * @returns {String}
     */
    getLessonUploadDirectory(lessonId) {
        if (!lessonId) {
            return this.getUploadDirectory();
        }

        return path.join(this.getUploadDirectory(), `/lessons/${lessonId.toString()}`);
    }

    /**
     * @param {Number} [tutorId]
     * @returns {String}
     */
    getTutorUploadDirectory(tutorId) {
        if (!tutorId) {
            return this.getUploadDirectory();
        }

        return path.join(this.getUploadDirectory(), `/tutors/${tutorId.toString()}`);
    }

    getMessageUploadDirectory(lessonId, messageId) {
        return path.join(this.getUploadDirectory(), `/lessonMessages/${lessonId}/${messageId.toString()}`);
    }

    getUserPhotoUploadDirectory(userId) {
        return path.join(this.getUploadDirectory(), `/userPhotos/${userId}`);
    }

    getRootUrl() {
        return `${this.app.get('frontendUrl')}${this.getRelativeUrl()}`;
    }

    getRelativeUrl() {
        return '/api/files';
    }

    getRelativeRecordingUrl() {
        return '/api/recordings';
    }

    makeRecordingsPaths(basePath, lessonId) {
        return {
            basePath,
            tutorVideoPath: path.join(basePath, 'tutor.mp4'),
            studentVideoPath: path.join(basePath, 'student.mp4'),
            renderOutputVideoPath: path.join(basePath, 'output.mp4'),
            resultVideoPath: path.join(basePath, 'lesson.mp4'),
            recordingUrl: `${this.getRelativeRecordingUrl()}/${lessonId}/lesson.mp4`,
        };
    }

    getRecordingsPaths(lessonId) {
        const stringLessonId = String(lessonId);
        const root = this.getRootRecordingsDirectory();
        const basePath = path.join(root, stringLessonId);
        return this.makeRecordingsPaths(basePath, stringLessonId);
    }

    getRecordingsKurentoPaths(lessonId) {
        const stringLessonId = String(lessonId);
        const recordingsPath = this.app.get('storageRecordingsPath');
        const basePath = path.join(recordingsPath, stringLessonId);
        return this.makeRecordingsPaths(basePath, stringLessonId);
    }

    /**
     * @param {String} [filename] - filename with extension
     * @param {String} [extension] - file extension
     * @param {Number} [length] - name key length
     * @returns {String}
     */
    generateRandomFilename({ filename, extension, length = 8 } = {}) {
        const name = generateRandomValue(length);

        if (filename) {
            return `${name}_${filename}`;
        }

        return `${name}.${extension}`;
    }

    get app() {
        if (this._app) {
            return this._app;
        }

        this._app = require('../../../server/server');
        return this._app;
    }
}

module.exports = new StoragePaths();
