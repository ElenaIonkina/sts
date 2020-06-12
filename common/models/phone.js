'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Phone');
const sendVerificationCode = require('../methods/phone/sendVerificationCode');
const sendUpdatePhoneCode = require('../methods/phone/sendUpdatePhoneCode');
const verifyCode = require('../methods/phone/verifyCode');
const verifyUpdatePhoneCode = require('../methods/phone/verifyUpdatePhoneCode');
const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');
const app = require('../../server/server');

const PhoneTokenModel = require('../defineModels/phone/PhoneTokenModel');

module.exports = function createPhoneModel(Phone) {
    definePhoneModels();
    Phone.remoteMethod('sendVerificationCode', {
        http: { path: '/send-verification-code', verb: 'post' },
        accepts: [
            { arg: 'phoneNumber', type: 'string', required: true },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Sends verification code to the phoneNumber argument. May return following errors: errors.invalidPhone 422, errors.userBlocked 403, errors.serviceError 500. No id in result!',
    });
    Phone.sendVerificationCode = wrapper(sendVerificationCode);

    Phone.remoteMethod('verifyCode', {
        http: { path: '/verify-code', verb: 'post' },
        accepts: [
            { arg: 'languageCode', type: 'string', required: true },
            { arg: 'phoneNumber', type: 'string', required: true },
            { arg: 'smsCode', type: 'string', required: true },
            { arg: 'deviceToken', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'PhoneToken', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Verifies smsCode on phoneNumber argument. May return following errors: errors.invalidPhone 422, errors.userBlocked 403,' +
            'errors.languageNotFound 404, errors.wrongSmsCode 400, errors.serviceError 500. If user registered, then isCreated = false and returns token, otherwise isCreated = true and no token',
    });
    Phone.verifyCode = wrapper(verifyCode);

    Phone.remoteMethod('sendUpdatePhoneCode', {
        http: { path: '/send-update-phone-code', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'phoneNumber', type: 'string', required: true },
            { arg: 'oldPhoneNumber', type: 'string', required: true },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Sends update phone code to the phoneNumber argument. May return following errors: errors.invalidPhone 422, errors.userPhoneNotFound 404, errors.serviceError 500. No id in result!',
    });
    Phone.sendUpdatePhoneCode = wrapper(sendUpdatePhoneCode);

    Phone.remoteMethod('verifyUpdatePhoneCode', {
        http: { path: '/verify-update-phone-code', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'phoneNumber', type: 'string', required: true },
            { arg: 'smsCode', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Verifies smsCode on phoneNumber argument for updating phone number. May return following errors: errors.invalidPhone 422,' +
            'errors.wrongSmsCode 400, errors.serviceError 500.',
    });
    Phone.verifyUpdatePhoneCode = wrapper(verifyUpdatePhoneCode);
};

const definePhoneModels = () => {
    app.dataSources.db.define('PhoneToken', formatDefineFromModel(PhoneTokenModel));
};

