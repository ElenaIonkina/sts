const { getTransactionInfo } = require('../../api/payTabsApi');
const { sendAddCardEvent } = require('../../../socket/controllers/card');

module.exports = async function saveCard(models, {
    transactionId,
    orderId,
    paymentRef,
    cardData,
    userId,
}) {
    const {
        cardEmail,
        cardPass,
        cardToken,
    } = cardData;
    const transactionInfo = await getTransactionInfo(transactionId);
    const lastDigits = transactionInfo['card_last_four_digits'];
    if (!lastDigits) throw new Error(`Unable get last four card digits for transaction ${transactionId}`);
    const card = await models.UserCard.create({
        cardToken,
        cardEmail,
        cardPassword: cardPass,
        lastDigits,
        orderId,
        transactionId,
        paymentRef,
        baseUserId: userId,
    });
    const userCards = await models.UserCard.find({ where: { baseUserId: userId, isDeleted: false } });
    if (userCards.length === 1) {
        await models.BaseUser.updateAll({ id: userId }, { defaultCardId: card.id });
    }
    sendAddCardEvent(userId, card.id, lastDigits);
};
