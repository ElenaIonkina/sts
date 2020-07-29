const { sendFailAddCardEvent, sendPendingAddCardEvent, sendAddCardEvent } = require('../../../socket/controllers/card');
const { getPaymentInfo } = require('../../api/payTabsApi');
const { getTransactionInfo } = require('../../api/tapAPI');
const { SUCCESS, NOT_FOUND } = require('../../helpers/const/PaytabsResponseCodes');
const scheduleRefundAddCard = require('../schedulers/refundAddCardScheduler');
const scheduleSaveCard = require('../schedulers/saveCardScheduler');
const logger = require('../../utils/logger');
const { parse } = require('cookie');
function getCardData(orderData) {
    const cardEmail = orderData['pt_customer_email'];
    const cardPass = orderData['pt_customer_password'];
    const cardToken = orderData['pt_token'];
    if (!cardEmail || !cardPass || !cardToken) return null;
    return {
        cardEmail,
        cardPass,
        cardToken,
    };
}

module.exports = async function processPaymentHook(models, { chargeId, parsedOrderId }) {
    try {
        const { lessonId } = parsedOrderId;
        const orderId = parsedOrderId['orderId']
        const lesson = await models.Lesson.findOne({ where: { id: lessonId } });
        const userId = lesson.baseUserId;
        const user = await models.BaseUser.findById(userId);
        if (!user) return;
    /*       const cardData = getCardData(orderData);
        if (!cardData) return sendFailAddCardEvent(userId); */

        // const paymentRef = orderData['payment_reference'];
        // const paymentInfo = await getPaymentInfo(paymentRef);
        // if (paymentInfo['reference_no'] !== orderId['orderId']) return;
        const paymentInfo = await getTransactionInfo(chargeId);
        const status = paymentInfo['status'];
        if (!status) return;
        // if (status === NOT_FOUND) return;
        if (status !== 'CAPTURED') return sendFailAddCardEvent(userId);

        await Promise.all([
            sendAddCardEvent(userId, null, null),
            await models.TransactionInfo.updateAll({ orderId: orderId, lessonId: lessonId }, { transactionId: transactionId }),
/*          scheduleRefundAddCard(models, transactionId, orderIdString),
            scheduleSaveCard(models, transactionId, orderIdString, paymentRef, cardData, userId),*/
        ]);
    } catch (e) {
        sendPendingAddCardEvent(parsedOrderId.userId);
        throw e;
    }
};