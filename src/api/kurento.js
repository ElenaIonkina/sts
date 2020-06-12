const bluebird = require('bluebird');
const kurentoClient = bluebird.promisifyAll(require('kurento-client'));
const { getElements, getPipeline, dropKurentoElements, dropPipeline } = require('../datasource/redis/endpoints/kurentoElements');
const { dropCallRequests } = require('../datasource/redis/endpoints/callRequests');
const { dropUserLessons } = require('../datasource/redis/endpoints/userLessons');
const logger = require('../utils/logger');

let client = null;

async function initKurento(app) {
    client = await kurentoClient(app.get('kurentoHost') || 'ws://kms:8888/kurento');
    client = bluebird.promisifyAll(client);
    await clearKms();
}

function getKurento() {
    return client;
}

async function clearKms() {
    const elements = await getElements();
    await Promise.all(elements.map(async (e) => {
        const [studentEndpoint, tutorEndpoint, tutorRecorder] = await Promise.all([
            client.getMediaobjectByIdAsync(e.studentEndpointId).catch(logError),
            client.getMediaobjectByIdAsync(e.tutorEndpointId).catch(logError),
            client.getMediaobjectByIdAsync(e.tutorRecorderId).catch(logError),
        ]);
        if (studentEndpoint) studentEndpoint.release();
        if (tutorEndpoint) tutorEndpoint.release();
        if (tutorRecorder) tutorRecorder.release();
        dropKurentoElements(e.lessonId);
    }));

    await Promise.all([
        dropUserLessons(),
        dropCallRequests(),
    ]);

    const pipelineData = await getPipeline();
    if (!pipelineData) return;
    const kurentoPipeline = await client.getMediaobjectByIdAsync(pipelineData.pipelineId).catch(logError);
    if (kurentoPipeline) kurentoPipeline.release();
    await dropPipeline();
}

function logError(e) {
    logger.error(e);
}

module.exports = {
    initKurento,
    getKurento,
};
