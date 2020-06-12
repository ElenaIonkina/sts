const { KURENTO_ELEMENTS, KURENTO_PIPELINE_ID } = require('../keys');
const redisClient = require('../client');

async function addKurentoElements(lessonId, studentEndpointId, tutorEndpointId, tutorRecorderId) {
    const redis = redisClient.getRedis();
    await redis.setAsync(getKurentoElementsKey(lessonId), JSON.stringify({
        lessonId,
        studentEndpointId,
        tutorEndpointId,
        tutorRecorderId,
    }));
}

async function setPipeline(pipelineId) {
    const redis = redisClient.getRedis();
    await redis.setAsync(KURENTO_PIPELINE_ID, JSON.stringify({
        pipelineId,
    }));
}

async function getElements() {
    const redis = redisClient.getRedis();
    const keys = await redis.keysAsync(getKurentoElementsKey('*'));
    const jsonElements = await Promise.all(keys.map(k => redis.getAsync(k)));
    return jsonElements.map(e => JSON.parse(e));
}

async function getPipeline() {
    const redis = redisClient.getRedis();
    const jsonPipeline = await redis.getAsync(KURENTO_PIPELINE_ID);
    return JSON.parse(jsonPipeline);
}

async function dropPipeline() {
    const redis = redisClient.getRedis();
    await redis.delAsync(KURENTO_PIPELINE_ID);
}

async function getKurentoElements(lessonId) {
    const redis = redisClient.getRedis();
    const kurentoElements = await redis.getAsync(getKurentoElementsKey(lessonId));
    return JSON.parse(kurentoElements);
}

async function dropKurentoElements(lessonId) {
    const redis = redisClient.getRedis();
    await redis.delAsync(getKurentoElementsKey(lessonId));
}

function getKurentoElementsKey(lessonId) {
    return `${KURENTO_ELEMENTS}:${lessonId}`;
}

module.exports = {
    dropKurentoElements,
    addKurentoElements,
    getKurentoElements,
    setPipeline,
    getPipeline,
    dropPipeline,
    getElements,
};
