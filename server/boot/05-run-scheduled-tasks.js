module.exports = async function runScheduledTask(app) {
    await app.dataSources.mysql.transaction(async (models) => {
        const tasks = await models.ScheduledTask.find();
        await Promise.all(tasks.map(t => t.save()));
    });
};
