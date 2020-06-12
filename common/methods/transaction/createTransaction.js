const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleProcessTransaction = require('../../../src/tasksScheduler/schedulers/processTransactionScheduler');

module.exports = async function createTransaction(req) {
    const transactionId = req.body['transaction_id'];
    if (!transactionId || typeof transactionId !== 'string') return {};

    await runMySQLTransactions(async (models) => {
        await scheduleProcessTransaction(models, transactionId);
    });
    return {};
};
