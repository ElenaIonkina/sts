const { DROP_CALL_EVENT } = require('../TaskTypes');
const getLessonEndMoment = require('../../helpers/getLessonEndMoment');

module.exports = async function scheduleDropCall(models, startTime, duration, studentId, tutorId, lessonId) {
    await models.ScheduledTask.create({
        type: DROP_CALL_EVENT,
        time: getLessonEndMoment(startTime, duration).toDate(),
        data: {
            lessonId,
            studentId,
            tutorId,
        },
    });
};
