'use strict';

const getSupportNumber = require('../methods/serviceKeys/getSupportNumber');
const wrapper = require('../../src/helpers/createWrapper')('Tutor');

module.exports = function createServiceKeyModel(ServiceKey) {
    ServiceKey.remoteMethod('getSupportNumber', {
        http: { path: '/support-number', verb: 'get' },
        description: 'Returns service support number',
        accepts: [],
        returns: [
            { arg: 'supportNumber', type: 'string', root: true },
            { arg: 'error', type: 'object', root: true },
        ],

    });
    ServiceKey.getSupportNumber = wrapper(getSupportNumber);
};
