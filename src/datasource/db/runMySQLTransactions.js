const app = require('../../../server/server');

/**
 * @param {Function} transactions - async (models) func
 * @returns {Promise<void>}
 *
 */
module.exports = async function runMySQLTransactions(transactions) {
    await app.dataSources.mysql.transaction(transactions);
};
