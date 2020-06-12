const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const { createLinkAsync } = require('../../../src/api/branchIoApi');
const generateRandomValue = require('../../../src/helpers/generateRandomValue');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const TOKEN_LENGTH = 128;

module.exports = async function getLink(req, lessonId) {
    const { userId } = req.accessToken;
    const lesson = await this.app.models.Lesson.findById(lessonId);
    if (!lesson || lesson.baseUserId !== userId) {
        throw new LessonNotFoundError();
    }

    if (lesson.url) {
        return {
            result: {
                link: lesson.url,
            },
        };
    }

    const res = { result: {} };
    await runMySQLTransactions(async (models) => {
        const token = generateRandomValue(TOKEN_LENGTH);
        const linkPath = `lessons/share/${token}`;
        res.result.link = await createLinkAsync(linkPath);
        await Promise.all([
            models.Lesson.updateAll({
                id: lessonId,
            }, {
                url: res.link,
            }),
            models.ShareToken.create({
                token,
                lessonId,
            }),
        ]);
    });

    return res;
};
