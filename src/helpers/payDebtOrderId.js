const ORDER_ID_PREFIX = 'payDebt';
const SEPARATOR = '_';
const SEPARATED_PATHS = 4;

function generateOrderId(debtId, userId) {
    const now = Date.now();
    return `${ORDER_ID_PREFIX}${SEPARATOR}${debtId}${SEPARATOR}${userId}${SEPARATOR}${now}`;
}

function getIsOrderIdValuesNotValid(debtId, timestamp, userId) {
    return isNaN(debtId) || isNaN(timestamp) || isNaN(userId) ||
        debtId % 1 !== 0 || timestamp % 1 !== 0 || userId % 1 !== 0;
}

function parseOrderId(orderId) {
    const splittedOrderId = orderId.split(SEPARATOR);
    if (splittedOrderId.length !== SEPARATED_PATHS || splittedOrderId[0] !== ORDER_ID_PREFIX) return null;
    const debtId = Number(splittedOrderId[1]);
    const userId = Number(splittedOrderId[2]);
    const timestamp = Number(splittedOrderId[3]);
    const isOrderIdValuesNotValid = getIsOrderIdValuesNotValid(debtId, timestamp, userId);
    if (isOrderIdValuesNotValid) return null;
    return {
        debtId,
        timestamp,
        userId,
        orderId,
    };
}

module.exports = {
    generateOrderId,
    parseOrderId,
};
