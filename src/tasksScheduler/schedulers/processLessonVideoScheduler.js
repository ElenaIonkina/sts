const moment = require('moment');
const { PROCESS_LESSON_VIDEO } = require('../TaskTypes');

const MINUTES_TO_SCHEDULE_LATER = 10;

module.exports = function scheduleProcessLessonVideo(models, lessonId, later) {
    const executeDate = getExecuteTime(later);
    return models.ScheduledTask.create({
        type: PROCESS_LESSON_VIDEO,
        time: executeDate,
        data: {
            lessonId,
        },
    });
};

function getExecuteTime(later) {
    if (!later) return null;
    return moment().add(MINUTES_TO_SCHEDULE_LATER, 'm').toDate();
}
