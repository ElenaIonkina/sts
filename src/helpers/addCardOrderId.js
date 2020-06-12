const ORDER_ID_PREFIX = 'addCard';
const SEPARATOR = '_';
const SEPARATED_PATHS = 3;

function generateOrderId(userId) {
    const now = Date.now();
    return `${ORDER_ID_PREFIX}${SEPARATOR}${userId}${SEPARATOR}${now}`;
}

function parseOrderId(orderId) {
    const splittedOrderId = orderId.split(SEPARATOR);
    if (splittedOrderId.length !== SEPARATED_PATHS || splittedOrderId[0] !== ORDER_ID_PREFIX) return null;
    const userId = Number(splittedOrderId[1]);
    const timestamp = Number(splittedOrderId[2]);
    if (isNaN(userId) || userId % 1 !== 0 || isNaN(timestamp) || timestamp % 1 !== 0) return null;
    return {
        userId,
        timestamp,
        orderId,
    };
}

module.exports = {
    generateOrderId,
    parseOrderId,
};
