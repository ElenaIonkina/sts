const { refundAddCard } = require('../../api/payTabsApi');
const { REFUND_SENT } = require('../../helpers/const/PaytabsResponseCodes');
const app = require('../../../server/server');

module.exports = async function refundTransaction(models, { orderId, transactionId }) {
    if (app.get('noRefund')) return;
    const res = await refundAddCard(orderId, transactionId);
    if (res['response_code'] === REFUND_SENT) return;
    throw new Error(`Unable refund add card transaction ${transactionId} ${orderId}`);
};
