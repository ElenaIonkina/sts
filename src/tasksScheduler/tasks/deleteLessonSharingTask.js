module.exports = async function deleteLessonSharing(models, { lessonIds }) {
    await models.SharedLesson.destroyAll({ id: { inq: lessonIds } });
};
