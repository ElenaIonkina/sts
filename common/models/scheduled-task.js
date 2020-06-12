'use strict';

const scheduleTask = require('../methods/scheduled-task/after-save/schedule-task');

module.exports = function createScheduledTask(ScheduledTask) {
    ScheduledTask.observe('after save', scheduleTask);
};
