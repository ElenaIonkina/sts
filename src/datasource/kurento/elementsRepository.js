const bluebird = require('bluebird');
const getApp = require('../../helpers/getApp');
const { getKurento } = require('../../api/kurento');
const { getOrCreatePipeline } = require('./pipelineManager');
const { addKurentoElements, getKurentoElements, dropKurentoElements } = require('../redis/endpoints/kurentoElements');
const storagePaths = require('../storage/storagePaths');

const VIDEO_BITRATE = 1024;

async function createElements(lessonId, studentId, tutorId) {
    const pipeline = await getOrCreatePipeline();
    const { studentVideoPath, tutorVideoPath } = storagePaths.getRecordingsKurentoPaths(lessonId);
    const [studentEndpoint, tutorEndpoint, tutorRecorder, studentRecorder] = (await Promise.all([
        pipeline.createAsync('WebRtcEndpoint'),
        pipeline.createAsync('WebRtcEndpoint'),
        pipeline.createAsync('RecorderEndpoint', { uri: `file://${tutorVideoPath}` }),
        pipeline.createAsync('RecorderEndpoint', { uri: `file://${studentVideoPath}` }),
    ])).map(e => bluebird.promisifyAll(e));

    await studentEndpoint.setMaxVideoRecvBandwidth(VIDEO_BITRATE);
    await tutorEndpoint.setMaxVideoRecvBandwidth(VIDEO_BITRATE);
    const app = getApp();
    const instanceName = app.get('instanceName');
    await Promise.all([
        addKurentoElements(lessonId, studentEndpoint.id, tutorEndpoint.id, tutorRecorder.id),
        studentEndpoint.setNameAsync(`Tutoring_App_Student_${studentId}_Endpoint_Lesson_${lessonId}_${instanceName}`),
        tutorEndpoint.setNameAsync(`Tutoring_App_Tutor_${tutorId}_Endpoint_Lesson_${lessonId}_${instanceName}`),
        tutorRecorder.setNameAsync(`Tutoring_App_Tutor_Recorder_Lesson_${lessonId}_${instanceName}`),
        studentRecorder.setNameAsync(`Tutoring_App_Student_Recorder_Lesson_${lessonId}_${instanceName}`),
    ]);
    const elements = {
        studentEndpoint,
        tutorEndpoint,
        tutorRecorder,
        studentRecorder,
    };
    studentEndpoint.userId = studentId;
    tutorEndpoint.userId = tutorId;
    pipeline.endpointElements = pipeline.endpointElements || {};
    pipeline.endpointElements[lessonId] = elements;

    return elements;
}

async function getElements(lessonId) {
    const elementsIds = await getKurentoElements(lessonId);
    if (!elementsIds) return null;

    const pipeline = await getOrCreatePipeline();
    pipeline.endpointElements = pipeline.endpointElements || {};
    if (pipeline.endpointElements[lessonId]) {
        return pipeline.endpointElements[lessonId];
    }
    const kurento = getKurento();
    const [studentEndpoint, tutorEndpoint, tutorRecorder] = (await Promise.all([
        kurento.getMediaobjectByIdAsync(elementsIds.studentEndpointId),
        kurento.getMediaobjectByIdAsync(elementsIds.tutorEndpointId),
        kurento.getMediaobjectByIdAsync(elementsIds.tutorRecorderId),
    ])).map(e => bluebird.promisifyAll(e));

    const elements = {
        studentEndpoint,
        tutorEndpoint,
        tutorRecorder,
    };
    pipeline.endpointElements[lessonId] = elements;
    return elements;
}

async function dropElements(lessonId) {
    const elements = await getElements(lessonId);
    if (!elements) return;
    elements.studentEndpoint.release();
    elements.tutorEndpoint.release();
    elements.tutorRecorder.release();
    await dropKurentoElements(lessonId);
}

module.exports = {
    createElements,
    getElements,
    dropElements,
};
