const { getTransactionInfo } = require('../../api/payTabsApi');
const { NOT_FOUND } = require('../../helpers/const/PaytabsResponseCodes');
const { parseOrderId: payLessonParse } = require('../../helpers/payLessonOrderId');
const { parseOrderId: payDebtParse } = require('../../helpers/payDebtOrderId');
const processPayLesson = require('../../../common/methods/user-card/processPayLesson');
const processPayDebt = require('../../../common/methods/user-card/processPayDebt');

module.exports = async function processTransactionTask(models, { transactionId }) {
    const transactionInfo = await getTransactionInfo(transactionId);
    const responseCode = transactionInfo['response_code'];
    const orderIdString = transactionInfo['order_id'];
    if (responseCode === NOT_FOUND || !orderIdString) return;

    const payLessonIdData = payLessonParse(orderIdString);
    if (payLessonIdData) return processPayLesson(models, transactionInfo, responseCode, payLessonIdData, transactionId);

    const payDebtIdData = payDebtParse(orderIdString);
    if (payDebtIdData) {
        return processPayDebt(models, transactionInfo, responseCode, payDebtIdData, transactionId);
    }
};
