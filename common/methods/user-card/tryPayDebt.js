const runMySqlQuery = require('../../../src/datasource/db/runMySQLQuery');
const scheduleChargeCard = require('../../../src/tasksScheduler/schedulers/chargeCardScheduler');
const {
    addDebtPaymentProcessing,
    getDebtPaymentProcessing,
    dropDebtPaymentProcessing,
} = require('../../../src/datasource/redis/endpoints/debtPaymentProcessing');
const { generateOrderId } = require('../../../src/helpers/payDebtOrderId');

const CardNotFoundError = require('../../../src/helpers/errors/notFound/CardNotFound');

module.exports = async function tryPayDebt(req, cardId) {
    const { userId } = req.accessToken;
    const userCard = await this.app.models.UserCard.findOne({
        where: {
            id: cardId,
            baseUserId: userId,
            isDeleted: false,
        },
    });
    if (!userCard) {
        throw new CardNotFoundError();
    }

    const debtsQuery = `SELECT Debt.amount, Debt.id, Debt.lessonId
                        FROM tutoring.Debt
                            INNER JOIN Lesson L on Debt.lessonId = L.id
                        WHERE L.baseUserId = ${userId}`;

    const userDebts = await runMySqlQuery(debtsQuery);
    if (!userDebts.length)
        return {
            result: {
                success: true,
            },
        };

    for (const d of userDebts) {
        const processingDebt = await getDebtPaymentProcessing(d.id);
        if (processingDebt) continue;

        try {
            await addDebtPaymentProcessing(d.id, userId);
            const orderId = generateOrderId(d.id, userId);
            await scheduleChargeCard(this.app.models, { cardId, amount: d.amount, orderId });
        } catch (e) {
            await dropDebtPaymentProcessing(d.id, userId);
            throw e;
        }
    }

    return {
        result: {
            success: true,
        },
    };
};
