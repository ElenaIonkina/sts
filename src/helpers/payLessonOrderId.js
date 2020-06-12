const ORDER_ID_PREFIX = 'payLesson';
const SEPARATOR = '_';
const SEPARATED_PATHS = 3;

function generateOrderId(lessonId, paymentNumber) {
    const now = Date.now();
    return `${ORDER_ID_PREFIX}${SEPARATOR}${lessonId}${SEPARATOR}${paymentNumber}${SEPARATOR}${now}`;
}

// function getIsOrderIdValuesNotValid(lessonId, timestamp, paymentNumber) {
//     return isNaN(lessonId) || isNaN(timestamp) || isNaN(paymentNumber) ||
//         lessonId % 1 !== 0 || timestamp % 1 !== 0 || paymentNumber % 1 !== 0;
// }

function getIsOrderIdValuesNotValid(lessonId, timestamp) {
    return isNaN(lessonId) || isNaN(timestamp) || lessonId % 1 !== 0 || timestamp % 1 !== 0;
}

// function parseOrderId(orderId) {
//     const splittedOrderId = orderId.split(SEPARATOR);
//     if (splittedOrderId.length !== SEPARATED_PATHS || splittedOrderId[0] !== ORDER_ID_PREFIX) return null;
//     const lessonId = Number(splittedOrderId[1]);
//     const paymentNumber = Number(splittedOrderId[2]);
//     const timestamp = Number(splittedOrderId[3]);
//     const isOrderIdValuesNotValid = getIsOrderIdValuesNotValid(lessonId, timestamp, paymentNumber);
//     if (isOrderIdValuesNotValid) return null;
//     return {
//         lessonId,
//         timestamp,
//         orderId,
//         paymentNumber,
//     };
// }

function parseOrderId(orderId) {
    const splittedOrderId = orderId.split(SEPARATOR);
    if (splittedOrderId.length !== SEPARATED_PATHS || splittedOrderId[0] !== ORDER_ID_PREFIX) return null;
    const lessonId = Number(splittedOrderId[1]);
    const timestamp = Number(splittedOrderId[2]);
    const isOrderIdValuesNotValid = getIsOrderIdValuesNotValid(lessonId, timestamp);
    if (isOrderIdValuesNotValid) return null;
    return {
        lessonId,
        timestamp,
        orderId,
    };
}

module.exports = {
    generateOrderId,
    parseOrderId,
};
