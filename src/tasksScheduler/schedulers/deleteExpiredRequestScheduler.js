const moment = require('moment');

const { DELETE_EXPIRED_REQUEST } = require('../TaskTypes');

const DAYS_AFTER_NOW_TO_DELETE_REQUEST = 1;

module.exports = async function scheduleDeleteRequest(models, request) {
    const executeDate = moment().add(DAYS_AFTER_NOW_TO_DELETE_REQUEST, 'd').toDate();
    await models.ScheduledTask.create({
        type: DELETE_EXPIRED_REQUEST,
        time: executeDate,
        data: {
            requestId: request.id,
        },
    });
};
