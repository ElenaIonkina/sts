const moment = require('moment');

module.exports = async function fixUnixMsToS(app) {
    if (!app.get('needToFixUnixMsToS')) return;
    const currentYear = moment().year();
    await app.dataSources.mysql.transaction(async (models) => {
        const lessons = await models.Lesson.find();
        await Promise.all(lessons.map(l => {
            const timeToYear = moment.unix(l.timeTo).year();
            if (isNaN(timeToYear) || timeToYear > currentYear + 100) l.timeTo = Math.floor(l.timeTo / 1000);
            const timeFromYear = moment.unix(l.timeFrom).year();
            if (isNaN(timeFromYear) || timeFromYear > currentYear + 100) l.timeFrom = Math.floor(l.timeFrom / 1000);
            return l.save();
        }));
    });
};
