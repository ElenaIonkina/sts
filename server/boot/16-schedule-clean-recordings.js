const runMySQLTransactions = require('../../src/datasource/db/runMySQLTransactions');
const { CLEAN_RECORDINGS } = require('../../src/tasksScheduler/TaskTypes');

module.exports = async function scheduleCleanRecordings(app) {
    const cleanRecordings = app.get('cleanRecordings');
    if (!cleanRecordings) return;
    await runMySQLTransactions(async (models) => {
        await models.ScheduledTask.findOrCreate({
            where: {
                type: CLEAN_RECORDINGS,
            },
        }, {
            type: CLEAN_RECORDINGS,
            data: {},
            time: null,
        });
    });
};
