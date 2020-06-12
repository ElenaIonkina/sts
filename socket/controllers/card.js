const emitSocketByBaseUserIdIfActive = require('../../src/helpers/emitSocketByBaseUserIdIfActive');
const { emitOrDefer } = require('./deferredEvents');

const ADD_CARD_FAIL_EVENT = 'user:card:fail';
const ADD_CARD_PENDING_EVENT = 'user:card:pending';
const ADD_CARD_EVENT = 'user:card:add';
const ADD_CARD_DEBT = 'user:card:debt';
const PAY_DEBT_FAIL = 'user:debt:fail';
const PAY_DEBT_SUCCESS = 'user:debt:success';

function sendFailAddCardEvent(userId) {
    emitSocketByBaseUserIdIfActive(userId, ADD_CARD_FAIL_EVENT, {});
}

function sendAddCardEvent(userId, cardId, lastDigits) {
    emitSocketByBaseUserIdIfActive(userId, ADD_CARD_EVENT, { cardId, lastDigits });
}

function sendPendingAddCardEvent(userId) {
    emitSocketByBaseUserIdIfActive(userId, ADD_CARD_PENDING_EVENT, {});
}

async function sendDebtEvent(userId, amount, lessonId, currency) {
    const eventData = { amount, lessonId, currency };
    await emitOrDefer({ lessonId, data: eventData, event: ADD_CARD_DEBT, receiverUserId: userId });
}

function sendPayDebtFail(userId) {
    emitSocketByBaseUserIdIfActive(userId, PAY_DEBT_FAIL, {});
}

async function sendPayDebtSuccess(userId) {
    await emitOrDefer({ data: {}, event: PAY_DEBT_SUCCESS, receiverUserId: userId });
}

module.exports = {
    sendFailAddCardEvent,
    sendPendingAddCardEvent,
    sendAddCardEvent,
    sendDebtEvent,
    sendPayDebtFail,
    sendPayDebtSuccess,
};
