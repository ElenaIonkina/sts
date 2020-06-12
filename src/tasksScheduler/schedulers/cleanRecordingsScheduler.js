const moment = require('moment');
const { CLEAN_RECORDINGS } = require('../TaskTypes');

const DAYS_TO_CLEAN = 5;

module.exports = async function scheduleCleanRecording(models) {
    const executeDate = moment().add(DAYS_TO_CLEAN, 'd');
    await models.ScheduledTask.create({
        type: CLEAN_RECORDINGS,
        time: executeDate,
        data: {},
    });
};
