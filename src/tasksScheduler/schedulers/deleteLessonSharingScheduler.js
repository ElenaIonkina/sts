const moment = require('moment');

const { DELETE_LESSON_SHARING } = require('../TaskTypes');

const MONTH_TO_DELETE = 1;

module.exports = async function scheduleDeleteLessonSharing(models, lessonIds) {
    const executeDate = moment().add(MONTH_TO_DELETE, 'M').toDate();
    await models.ScheduledTask.create({
        type: DELETE_LESSON_SHARING,
        time: executeDate,
        data: {
            lessonIds,
        },
    });
};
