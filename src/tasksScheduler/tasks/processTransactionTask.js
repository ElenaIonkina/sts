const { getTransactionInfo } = require('../../api/tapAPI');
const { NOT_FOUND } = require('../../helpers/const/PaytabsResponseCodes');
const { parseOrderId: payLessonParse } = require('../../helpers/payLessonOrderId');
const { parseOrderId: payDebtParse } = require('../../helpers/payDebtOrderId');
const processPayLesson = require('../../../common/methods/user-card/processPayLesson');
const processPayDebt = require('../../../common/methods/user-card/processPayDebt');

module.exports = async function processTransactionTask(models, { transactionId }) {
    const transactionInfo = await getTransactionInfo(transactionId);
    if (!transactionInfo['status']) return;
    const status = transactionInfo['status'];
    const orderIdString = transactionInfo['id'];
    if (status !== 'CAPTURED' || !orderIdString) return;

    const payLessonIdData = payLessonParse(orderIdString);
    if (payLessonIdData) return processPayLesson(models, transactionInfo, status, payLessonIdData, transactionId);

    const payDebtIdData = payDebtParse(orderIdString);
    if (payDebtIdData) {
        return processPayDebt(models, transactionInfo, status, payDebtIdData, transactionId);
    }
};
