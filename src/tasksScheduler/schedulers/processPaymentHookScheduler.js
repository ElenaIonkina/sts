const { PROCESS_PAYMENT_HOOK } = require('../TaskTypes');

module.exports = async function schedulerProcessPaymentHook(models, orderData, orderId) {
    return models.ScheduledTask.create({
        type: PROCESS_PAYMENT_HOOK,
        data: {
            orderData,
            orderId,
        },
    });
};
