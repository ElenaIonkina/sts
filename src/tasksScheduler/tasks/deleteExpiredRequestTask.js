module.exports = async function deleteExpiredRequest(models, { requestId }) {
    await models.Lesson.destroyAll({
        id: requestId,
    });
};
