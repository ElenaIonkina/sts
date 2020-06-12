const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function rateLesson(req, lessonId, rate) {
    const { userId } = req.accessToken;
    const lesson = await this.app.models.Lesson.findById(lessonId);
    const isLessonAccessible = await getIsLessonAccessible(lesson, rate);
    if (!isLessonAccessible) {
        throw new LessonNotFoundError();
    }
    const res = {
        result: {
            success: false,
        },
    };
    await runMySQLTransactions(async (models) => {
        const lessonRating = await models.LessonRating.findOne({
            where: {
                lessonId,
            },
        });
        if (!lessonRating) {
            models.LessonRating.create({
                lessonId,
                rate: rate,
            });
            res.result.success = true;
        }
    });
    return res;
};

async function getIsLessonAccessible(lesson, rate) {
    if (!lesson || (rate > 100 || rate < 0)) {
        return false;
    }
    return true;
}
