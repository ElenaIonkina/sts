const { PROCESS_TRANSACTION } = require('../TaskTypes');

module.exports = async function scheduleProcessTransaction(models, transactionId) {
    return models.ScheduledTask.create({
        type: PROCESS_TRANSACTION,
        data: {
            transactionId,
        },
    });
};
