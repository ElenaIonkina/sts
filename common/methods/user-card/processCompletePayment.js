const { parseOrderId } = require('../../../src/helpers/payLessonOrderId');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleProcessPaymentHook = require('../../../src/tasksScheduler/schedulers/processPaymentHookScheduler');

const PROCESSING = 'Processing...';

module.exports = async function processPayment(req, orderId) {
    const parsedOrderId = parseOrderId(orderId);
    const { body } = req;
    const isNotPaymentRequest = !parsedOrderId || !body ||
        !body['payment_reference'] || typeof body['payment_reference'] !== 'string';
    if (isNotPaymentRequest) return null;
    await runMySQLTransactions(async (models) => {
        await scheduleProcessPaymentHook(models, req.body, parsedOrderId);
    });
    return PROCESSING;
};
