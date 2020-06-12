'use strict';
const wrapper = require('../../src/helpers/createWrapper')('TransactionInfo');
// const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');
// const app = require('../../server/server');

const createTransaction  = require('../methods/transaction/createTransaction');

module.exports = function createTransactionInfoModel(TransactionInfo) {
    defineTransactionInfoModels();

    TransactionInfo.remoteMethod('createTransaction', {
        http: { path: '/', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Payment system hook',
    });
    TransactionInfo.createTransaction = wrapper(createTransaction);
};

const defineTransactionInfoModels = () => {
    // app.dataSources.db.define('CardInfo', formatDefineFromModel(CardInfoModel));
};

