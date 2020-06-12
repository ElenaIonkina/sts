'use strict';
const wrapper = require('../../src/helpers/createWrapper')('TestFeatures');
const app = require('../../server/server');

const PASSWORD = 'ajhfcjanntcn';
module.exports = function createTestFeatures(TestFeatures) {
    TestFeatures.remoteMethod('testVerifyCode', {
        http: { path: '/testVerifyCode', verb: 'post' },
        accepts: [
            { arg: 'password', type: 'string', required: true },
        ],
        returns: { arg: 'test', type: 'TestFeatures' },

    });
    TestFeatures.testVerifyCode = wrapper(testVerifyCode);
};

const testVerifyCode = async (password) => {
    if (password !== PASSWORD) return false;
    const testFeature = await app.models.TestFeatures.findOrCreate({}, {});
    testFeature[0].verifyPhone = !testFeature[0].verifyPhone;
    return await testFeature[0].save();
};
