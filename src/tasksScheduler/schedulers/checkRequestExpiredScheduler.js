const moment = require('moment');
const URGENCY = require('../../helpers/const/Urgency');
const { CHECK_REQUEST_EXPIRED } = require('../TaskTypes');

const DAYS_AFTER_CREATED_ON_NOW_REQUEST = 1;
const MINUTES_AFTER_TIME_TO_LATER_REQUEST = 15;

module.exports = async function scheduleCheckRequestExpired(models, request) {
    const executeDate = getExecuteDate(request);
    await models.ScheduledTask.create({
        type: CHECK_REQUEST_EXPIRED,
        time: executeDate,
        data: {
            requestId: request.id,
        },
    });
};

function getExecuteDate(request) {
    const { urgency } = request;
    switch (urgency) {
        case URGENCY.Now:
            return moment(request.createdOn).add(DAYS_AFTER_CREATED_ON_NOW_REQUEST, 'd').toDate();
        case URGENCY.Later:
            return moment.unix(request.timeTo).add(MINUTES_AFTER_TIME_TO_LATER_REQUEST, 'm').toDate();
        default:
            throw new Error(`Invalid request for check request expired scheduler urgency: ${urgency}`);
    }
}
