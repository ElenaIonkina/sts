const { LESSON_PAYMENT_PROCESSING } = require('../keys');
const { setValue, getValue, dropValue } = require('./common');

async function addLessonPaymentProcessing(studentId, lessonId, paymentNumber) {
    const key = getLessonPaymentProcessingKey(lessonId, paymentNumber);
    await setValue(key, {});
}

async function dropLessonPaymentProcessing(lessonId, paymentNumber) {
    const key = getLessonPaymentProcessingKey(lessonId, paymentNumber);
    await dropValue(key);
}

async function getLessonPaymentProcessing(lessonId, paymentNumber) {
    const key = getLessonPaymentProcessingKey(lessonId, paymentNumber);
    return getValue(key);
}

function getLessonPaymentProcessingKey(lessonId, paymentNumber) {
    return `${LESSON_PAYMENT_PROCESSING}:${lessonId}:${paymentNumber}`;
}

module.exports = {
    addLessonPaymentProcessing,
    getLessonPaymentProcessing,
    getLessonPaymentProcessingKey,
    dropLessonPaymentProcessing,
};
