const { SAVE_CARD } = require('../TaskTypes');

module.exports = async function scheduleRefundAddCard(models, transactionId, orderId, paymentRef, cardData, userId) {
    return models.ScheduledTask.create({
        type: SAVE_CARD,
        data: {
            transactionId,
            orderId,
            paymentRef,
            cardData,
            userId,
        },
    });
};
