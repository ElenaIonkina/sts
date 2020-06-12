const { SUCCESS } = require('../../../src/helpers/const/PaytabsResponseCodes');
const { DEBTOR } = require('../../../src/helpers/const/userRoles');
const { dropCallWithDebt } = require('../../../socket/controllers/calls');
const { dropValue } = require('../../../src/datasource/redis/endpoints/common');
const { getLessonPaymentProcessingKey } = require('../../../src/datasource/redis/endpoints/lessonPaymentProcessings');

module.exports = async function processPayLesson(models, transactionInfo, status, orderIdData, transactionId) {
    const { lessonId, orderId, paymentNumber } = orderIdData;
    const amount = Number(transactionInfo.amount);
    const { currency } = transactionInfo;
    const key = getLessonPaymentProcessingKey(lessonId, paymentNumber);
    if (status !== 'CAPTURED') {
        const { baseUserId } = await models.Lesson.findById(lessonId);
        await Promise.all([
            models.Debt.findOrCreate({
                where: {
                    amount,
                    currency,
                    lessonId,
                },
            }, {
                amount,
                currency,
                lessonId,
            }),
            models.BaseUser.updateAll({ id: baseUserId }, {
                role: DEBTOR,
            }),
        ]);
        const lesson = await models.Lesson.findById(lessonId, { include: 'tutor' });
        const tutorId = lesson.tutor().baseUserId;
        await dropCallWithDebt(lessonId, amount, currency, lesson.baseUserId, tutorId);
        await dropValue(key);
        return;
    }

    await models.TransactionInfo.findOrCreate({
        where: {
            transactionId,
        },
    }, {
        orderId,
        currency,
        lessonId,
        amount,
        transactionId,
    });

    await dropValue(key);
};
