const { getUserLesson } = require('../../datasource/redis/endpoints/userLessons');
const { sendQuarterEndEvent } = require('../../../socket/controllers/calls');

module.exports = async function sendQuarterEventIfNeed(models, { secondsLeft, studentId, tutorId, lessonId }) {
    const [studentLesson, tutorLesson] = await Promise.all([
        getUserLesson(studentId),
        getUserLesson(tutorId),
    ]);
    const needToSendEvent = getNeedToSendEvent(studentLesson, tutorLesson, lessonId);
    if (!needToSendEvent) return;

    sendQuarterEndEvent(tutorId, studentId, secondsLeft);
};

function getNeedToSendEvent(studentLesson, tutorLesson, lessonId) {
    return studentLesson && tutorLesson && !studentLesson.extended && !tutorLesson.extended &&
        studentLesson.lessonId === lessonId && tutorLesson.lessonId === lessonId;
}
