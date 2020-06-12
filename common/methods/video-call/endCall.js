const schedulePayLesson = require('../../../src/tasksScheduler/schedulers/payLessonScheduler');

module.exports = async function endCall(models, lessonId, extendedAt, payLesson) {
    const lesson = await models.Lesson.findById(lessonId);

    if (payLesson) await schedulePayLesson(models, lesson, extendedAt, true);
    lesson.finished = true;

    await lesson.save();
};
