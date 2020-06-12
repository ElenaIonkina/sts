const { CHARGE_CARD } = require('../TaskTypes');

module.exports = async function scheduleChargeCard(models, { cardId, orderId, amount, title, productName, currency }, options = {}) {
    return  models.ScheduledTask.create({
        type: CHARGE_CARD,
        data: {
            title,
            cardId,
            orderId,
            productName,
            amount,
            currency,
            ...options,
        },
    });
};
