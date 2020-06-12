const moment = require('moment');
const scheduleDeleteRequest = require('../schedulers/deleteExpiredRequestScheduler');

module.exports = async function checkRequestExpired(models, { requestId }) {
    const request = await models.Lesson.findById(requestId);
    const isRequestExpired = getIsRequestExpired(request);
    if (!isRequestExpired) return;
    request.expiredAt = moment().unix();
    await Promise.all([
        request.save(),
        scheduleDeleteRequest(models, request),
    ]);
};

function getIsRequestExpired(request) {
    return request && !request.startTime;
}

