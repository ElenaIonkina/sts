const moment = require('moment');
const schedule = require('node-schedule');
const executeTask = require('../../../../src/tasksScheduler/taskExecutor');

const MINUTES_AFTER_NOW_TO_EXECUTE = 5;

module.exports = function scheduleTask(ctx, next) {
    if (!ctx.instance) return next();
    if (!ctx.options.transaction) {
        scheduleInstance(ctx.instance);
        return next();
    }
    ctx.options.transaction.observe('after commit', (tctx, tnext) => {
        scheduleInstance(ctx.instance);
        tnext();
    });
    next();
};

function scheduleInstance(instance) {
    const time = getExecuteTimeGreaterNow(instance);
    if (!time) setTimeout(executeTask(instance), 0);
    else schedule.scheduleJob(time, executeTask(instance));
}

function getExecuteTimeGreaterNow(task) {
    if (!task.time) return null;
    const taskTime = moment(task.time);
    const now = moment();
    if (taskTime.isAfter(now)) return taskTime.toDate();
    return now.add(MINUTES_AFTER_NOW_TO_EXECUTE, 'm').toDate();
}
