const { PROCESS_PAYMENT_HOOK } = require('../TaskTypes');

module.exports = async function schedulerProcessPaymentHook(models, chargeId, parsedOrderId) {
    return models.ScheduledTask.create({
        type: PROCESS_PAYMENT_HOOK,
        data: {
            chargeId,
            parsedOrderId,
        },
    });
};
