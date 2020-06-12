const logger = require('../utils/logger');
const runMySQLTransactions = require('../datasource/db/runMySQLTransactions');

module.exports = function createCatchWithTransactionsWrapper(data, tryAsync, catchAsync, errorMessage) {
    return async () => {
        try {
            await runMySQLTransactions(async (models) => {
                await tryAsync(models, data);
            });
        } catch (e) {
            logger.error(e, errorMessage);
            await runMySQLTransactions(async (models) => {
                await catchAsync(models, data);
            });
        }
    };
};
