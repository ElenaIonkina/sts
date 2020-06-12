const { chargeCard } = require('../../api/payTabsApi');
const { getValue, setValue } = require('../../datasource/redis/endpoints/common');

async function tryLockIfNeed(key, value = {}) {
    if (!key) return true;
    const existingValue = await getValue(key);
    if (existingValue) return false;
    await setValue(key, value);
    return true;
}

module.exports = async function chargeCardTask(models, { title, cardId, orderId, productName, amount, currency, redisKeyToCheck, redisValueToSet }) {
    const lockResult = await tryLockIfNeed(redisKeyToCheck, redisValueToSet);
    if (!lockResult) return;
    const card = await models.UserCard.findById(cardId, {
        include: {
            relation: 'baseUser',
            scope: {
                include: 'phone',
            },
        },
    });
    const user = card.baseUser();
    const { phone } = user.phone();
    /* await chargeCard(orderId, user, card, phone, productName, amount, title, currency); */
};
