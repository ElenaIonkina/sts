const moment = require('moment');
const { SEND_QUARTER_EVENT } = require('../TaskTypes');

const THREE_QUARTERS = 0.75;
const SECOND = 60;

module.exports = async function scheduleSendLessonQuarterEndEvent(models, duration, studentId, tutorId, lessonId) {
    const quarterDuration = duration * THREE_QUARTERS;
    const leftDuration = duration - quarterDuration;
    const executeDate = moment().add(quarterDuration, 'm').toDate();
    await models.ScheduledTask.create({
        type: SEND_QUARTER_EVENT,
        time: executeDate,
        data: {
            lessonId,
            studentId,
            tutorId,
            secondsLeft: leftDuration * SECOND,
        },
    });
};
