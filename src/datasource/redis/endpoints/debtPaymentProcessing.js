const { DEBT_PAYMENT_PROCESSING } = require('../keys');
const { setValue, getValue, dropValue } = require('./common');

async function addDebtPaymentProcessing(debtId, userId) {
    const key = getDebtPaymentProcessingKey(debtId);
    await setValue(key, { userId });
}

async function dropDebtPaymentProcessing(debtId) {
    const key = getDebtPaymentProcessingKey(debtId);
    await dropValue(key);
}

async function getDebtPaymentProcessing(debtId) {
    const key = getDebtPaymentProcessingKey(debtId);
    return getValue(key);
}

function getDebtPaymentProcessingKey(debtId) {
    return `${DEBT_PAYMENT_PROCESSING}:${debtId}`;
}

module.exports = {
    getDebtPaymentProcessingKey,
    getDebtPaymentProcessing,
    dropDebtPaymentProcessing,
    addDebtPaymentProcessing,
};
