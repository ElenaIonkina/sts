const moment = require('moment');
const createCatchWithTransactionWrapper = require('../helpers/createCatchWithTransactionWrapper');

const checkRequestExpired = require('./tasks/checkRequestExpiredTask');
const deleteExpiredRequest = require('./tasks/deleteExpiredRequestTask');
const processLessonVideo = require('./tasks/processLessonVideoTask');
const cleanRecordings = require('./tasks/cleanRecordingsTask');
const sendQuarterEventIfNeed = require('./tasks/sendQuarterEventIfNeed');
const dropCallIfNeed = require('./tasks/dropCallIfNeedTask');
const deleteLessonSharing = require('./tasks/deleteLessonSharingTask');
const processPaymentHook = require('./tasks/processPaymentHookTask');
const saveCard = require('./tasks/saveCardTask');
const refundAddCard = require('./tasks/refundAddCardTask');
const chargeCard = require('./tasks/chargeCardTask');
const processTransaction = require('./tasks/processTransactionTask');

const {
    CHECK_REQUEST_EXPIRED,
    DELETE_EXPIRED_REQUEST,
    PROCESS_LESSON_VIDEO,
    CLEAN_RECORDINGS,
    SEND_QUARTER_EVENT,
    DROP_CALL_EVENT,
    DELETE_LESSON_SHARING,
    PROCESS_PAYMENT_HOOK,
    REFUND_ADD_CARD,
    SAVE_CARD,
    CHARGE_CARD,
    PROCESS_TRANSACTION,
} = require('./TaskTypes');

const GEOMETRIC_TASK_ATTEMPT_DENOMINATOR_MINUTES = 5;

const wrappedExecuteTask = (task) => createCatchWithTransactionWrapper(task, executeTask, processTaskError,
    `Failed to execute scheduled task with id: ${task.id}! Attempt: ${task.attempts}!`);

module.exports = wrappedExecuteTask;

async function executeTask(models, task) {
    if (!task) return;
    const taskFunc = getTaskFuncByType(task.type);
    await taskFunc(models, task.data);
    await destroyTaskById(models, task.id);
}

function getTaskFuncByType(type) {
    switch (type) {
        case CHECK_REQUEST_EXPIRED:
            return checkRequestExpired;
        case DELETE_EXPIRED_REQUEST:
            return deleteExpiredRequest;
        case PROCESS_LESSON_VIDEO:
            return processLessonVideo;
        case CLEAN_RECORDINGS:
            return cleanRecordings;
        case SEND_QUARTER_EVENT:
            return sendQuarterEventIfNeed;
        case DROP_CALL_EVENT:
            return dropCallIfNeed;
        case DELETE_LESSON_SHARING:
            return deleteLessonSharing;
        case SAVE_CARD:
            return saveCard;
        case PROCESS_PAYMENT_HOOK:
            return processPaymentHook;
        case REFUND_ADD_CARD:
            return refundAddCard;
        case PROCESS_TRANSACTION:
            return processTransaction;
        case CHARGE_CARD:
            return chargeCard;
        default:
            throw new Error(`Invalid task type: ${type}`);
    }
}

async function processTaskError(models, task) {
    await increaseTaskAttempt(models, task.id);
}

async function increaseTaskAttempt(models, taskId) {
    if (!taskId) return;
    const task = await models.ScheduledTask.findById(taskId);
    if (!task) return;
    task.attempts++;
    task.time = getNextAttemptDate(task.attempts);
    await task.save();
}

function getNextAttemptDate(attempts) {
    return moment().add(GEOMETRIC_TASK_ATTEMPT_DENOMINATOR_MINUTES * attempts, 'm').toDate();
}

async function destroyTaskById(models, taskId) {
    if (!taskId) return;
    await models.ScheduledTask.destroyAll({
        id: taskId,
    });
}
