const moment = require('moment');

const { CALL_REQUEST } = require('../keys');
const redisClient = require('../client');

async function addCallRequest(studentId, lessonId, dieTime, tutorId) {
    const redis = redisClient.getRedis();
    await redis.setAsync(getCallRequestKey(lessonId), JSON.stringify({ studentId, dieTime, tutorId }));
}

async function dropUserCallRequests(studentId) {
    const redis = redisClient.getRedis();
    const keys = await redis.keysAsync(getCallRequestKey('*'));
    await Promise.all(keys.map(async (key) => {
        const requestJson = await redis.getAsync(key);
        const request = JSON.parse(requestJson);
        if (request.studentId === studentId) await redis.delAsync(key);
    }));
}

async function dropCallRequests() {
    const redis = redisClient.getRedis();
    const keys = await redis.keysAsync(getCallRequestKey('*'));
    await Promise.all(keys.map(k => redis.delAsync(k)));
}

async function dropCallRequest(lessonId) {
    const redis = redisClient.getRedis();
    await redis.delAsync(getCallRequestKey(lessonId));
}

async function getCallRequest(lessonId) {
    const redis = redisClient.getRedis();
    const currentTime = moment().unix();
    const request = JSON.parse(await redis.getAsync(getCallRequestKey(lessonId)));
    const aliveRequest = request && currentTime < request.dieTime ? request : null;
    if (!aliveRequest) await dropCallRequest(lessonId);
    return aliveRequest;
}

function getCallRequestKey(lessonId) {
    return `${CALL_REQUEST}:${lessonId}`;
}

module.exports = {
    addCallRequest,
    dropUserCallRequests,
    dropCallRequest,
    getCallRequest,
    dropCallRequests,
};
