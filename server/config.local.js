'use strict';
const getRestApiRoot = require('../src/helpers/getRestApiRoot');

const config = require('./config.json');
const localConfig = require('./config/index.js');

if (localConfig.twilioPhoneNumberForSms && localConfig.twilioPhoneNumberForSms[0] !== '+') {
    localConfig.twilioPhoneNumberForSms = '+' + localConfig.twilioPhoneNumberForSms;
}

module.exports = {
    ...config,
    needToMigrateCountMsg: localConfig.needToMigrateCountMsg,
    disableSocketDoc: localConfig.disableSocketDoc,
    needToMigrateLanguages: localConfig.needToMigrateLanguages,
    needToMigrateLanguagesWithTranslations: localConfig.needToMigrateLanguagesWithTranslations,
    emailUser: localConfig.emailUser,
    emailPassword: localConfig.emailPassword,
    redisPass: localConfig.redisPass,
    redisHost: localConfig.redisHost,
    kurentoHost: localConfig.kurentoHost,
    instanceName: localConfig.instanceName,
    turnLogin: localConfig.turnLogin,
    turnPass: localConfig.turnPass,
    turnPort: localConfig.turnPort,
    turnIp: localConfig.turnIp,
    stunPort: localConfig.stunPort,
    branchIoKey: localConfig.branchIoKey,
    stunIp: localConfig.stunIp,
    migrateCountryCodes: localConfig.migrateCountryCodes,
    slackUrl: localConfig.slackUrl,
    slackChannel: localConfig.slackChannel,
    needToFixUnixMsToS: localConfig.needToFixUnixMsToS,
    cleanRecordings: localConfig.cleanRecordings,
    webClientUrl: localConfig.webClientUrl,
    payTabsSiteUrl: localConfig.payTabsSiteUrl,
    processAddCardUrl: localConfig.processAddCardUrl,
    serverIp: localConfig.serverIp,
    payTabsKey: localConfig.payTabsKey,
    payTabsEmail: localConfig.payTabsEmail,
    noRefund: localConfig.noRefund,
    restApiRoot: getRestApiRoot(),
    twilioAccountSid: localConfig.twilioAccountSid,
    twilioAcuthToken: localConfig.twilioAcuthToken,
    twilioPhoneNumberForSms: localConfig.twilioPhoneNumberForSms,
    remoting: {
        rest: {
            handleErrors: false,
        },
    },
};
