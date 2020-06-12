const { getUserLesson } = require('../../datasource/redis/endpoints/userLessons');
const { dropCallWithEvents } = require('../../../socket/controllers/calls');
const scheduleProcessLessonVideo = require('../schedulers/processLessonVideoScheduler');
const schedulePayLesson = require('../schedulers/payLessonScheduler');

module.exports = async function dropCallIfNeed(models, { lessonId, studentId, tutorId }) {
    const [studentLesson, tutorLesson] = await Promise.all([
        getUserLesson(studentId),
        getUserLesson(tutorId),
    ]);
    const isLessonProcessing = studentLesson && tutorLesson &&
        tutorLesson.lessonId === lessonId && studentLesson.lessonId === lessonId;
    if (!isLessonProcessing) return;

    const extendedAt = studentLesson.extendedAt && tutorLesson.extendedAt;
    const lesson = await models.Lesson.findById(lessonId);
    await schedulePayLesson(models, lesson, extendedAt, false, false);

    if (extendedAt) return;

    lesson.finished = true;
    await Promise.all([
        lesson.save(),
        models.Proposal.destroyAll({ lessonId }),
        dropCallWithEvents(lessonId, studentId, tutorId),
    ]);
    await scheduleProcessLessonVideo(models, lessonId);
};

