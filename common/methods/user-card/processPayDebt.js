const { SUCCESS } = require('../../../src/helpers/const/PaytabsResponseCodes');
const { STUDENT } = require('../../../src/helpers/const/userRoles');
const { sendPayDebtFail, sendPayDebtSuccess } = require('../../../socket/controllers/card');
const { dropValue } = require('../../../src/datasource/redis/endpoints/common');
const { getDebtPaymentProcessingKey } = require('../../../src/datasource/redis/endpoints/debtPaymentProcessing');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function processPayDebt(models, transactionInfo, responseCode, orderIdData, transactionId) {
    const { debtId, userId, orderId } = orderIdData;
    const amount = Number(transactionInfo.amount);
    const { currency } = transactionInfo;
    const key = getDebtPaymentProcessingKey(debtId);
    if (responseCode !== SUCCESS) {
        sendPayDebtFail(userId);
        await dropValue(key);
        return;
    }

    const debtCountQuery = `SELECT COUNT(Debt.id) AS count
                            FROM tutoring.Debt 
                                INNER JOIN Lesson L on Debt.lessonId = L.id
                            WHERE L.baseUserId = ${userId}`;
    const [debt, [{ count }]] = await Promise.all([
        models.Debt.findById(debtId),
        runMySQLQuery(debtCountQuery),
    ]);
    if (!debt) return;

    const { lessonId } = debt;
    await debt.destroy();
    await models.TransactionInfo.findOrCreate({
        where: {
            transactionId,
        },
    }, {
        orderId,
        currency,
        lessonId,
        amount,
        transactionId,
    });
    if (count - 1 === 0) {
        await models.BaseUser.updateAll({ id: userId }, { role: STUDENT });
        await sendPayDebtSuccess(userId);
    }

    await dropValue(key);
};
