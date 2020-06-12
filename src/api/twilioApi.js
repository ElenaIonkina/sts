'use strict';
const app = require('../../server/server');
const twilio = require('twilio')(app.get('twilioAccountSid'), app.get('twilioAcuthToken'));

const DEFAULT_SMS_NUMBER = app.get('twilioPhoneNumberForSms');

const UndefinedError = require('../helpers/errors/UndefinedError');
const InvalidPhoneError = require('../helpers/errors/validation/InvalidPhoneError');

/**
 * Send sms message to with text body
 * @param {object} options
 * @param {string} options.to - number for receive sms
 * @param {string} options.body - sms body (text)
 * @returns {Promise<void>}
 */
async function sendMessage(options) {
    try {
        await twilio.messages.create({
            ...options,
            from: DEFAULT_SMS_NUMBER,
        });
    } catch (e) {
        if (e.status === 400) {
            throw new InvalidPhoneError();
        }
        throw new UndefinedError();
    }
}

module.exports = {
    sendMessage,
};
