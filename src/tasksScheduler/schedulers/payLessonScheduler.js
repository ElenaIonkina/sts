const scheduleChargeCard = require('./chargeCardScheduler');
const { generateOrderId } = require('../../helpers/payLessonOrderId');
const { getLessonPaymentInfo } = require('../../helpers/getLessonPaymentInfo');
const { getLessonPaymentProcessingKey } = require('../../datasource/redis/endpoints/lessonPaymentProcessings');

module.exports = async function schedulePayLesson(models, lesson, extendedAt, callWasBroken, checkExtended) {
    const lessonPaymentInfo = getLessonPaymentInfo(lesson.priceInTimeUnitInDollars, lesson.duration, lesson.startTime, extendedAt, callWasBroken, checkExtended);
    if (!lessonPaymentInfo) return;

    const { amount, paymentNumber } = lessonPaymentInfo;
    const orderId = generateOrderId(lesson.id, paymentNumber);
    const redisKeyToCheck = getLessonPaymentProcessingKey(lesson.id, paymentNumber);
    await scheduleChargeCard(models, { cardId: lesson.cardId, orderId, amount }, { redisKeyToCheck });
};
