const { parseOrderId } = require('../../../src/helpers/payLessonOrderId');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleProcessPaymentHook = require('../../../src/tasksScheduler/schedulers/processPaymentHookScheduler');

const PROCESSING = 'Processing...';

module.exports = async function processPayment(tap_id, orderId) {    
    const parsedOrderId = parseOrderId(orderId);
    const chargeId = tap_id;    
    const isNotPaymentRequest = !parsedOrderId || !tap_id;
    if (isNotPaymentRequest) return null;
    await runMySQLTransactions(async (models) => {
        await scheduleProcessPaymentHook(models, chargeId, parsedOrderId);
    });
    return PROCESSING;
};
