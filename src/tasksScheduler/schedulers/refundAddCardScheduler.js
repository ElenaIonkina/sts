const { REFUND_ADD_CARD } = require('../TaskTypes');

module.exports = async function scheduleRefundAddCard(models, transactionId, orderId) {
    return models.ScheduledTask.create({
        type: REFUND_ADD_CARD,
        data: {
            transactionId,
            orderId,
        },
    });
};
