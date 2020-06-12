'use strict';
const wrapper = require('../../src/helpers/createWrapper')('UserCards');
const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');
const app = require('../../server/server');

const payForLesson = require('../methods/user-card/payForLesson');
const addCard = require('../methods/user-card/addCard');
const processCompletePayment = require('../methods/user-card/processCompletePayment');
const getCards = require('../methods/user-card/getUserCards');
const deleteCard = require('../methods/user-card/deleteCard');
const setDefaultCard = require('../methods/user-card/setDefaultCard');
const tryPayDebt = require('../methods/user-card/tryPayDebt');

const CardInfoModel = require('../defineModels/user-card/CardInfo');
const UserCardsInfoModel = require('../defineModels/user-card/UserCardsInfo');

module.exports = function createUserCardsModel(UserCard) {
    defineUserCardsModels();
    UserCard.remoteMethod('addCard', {
        http: { path: '/', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Method for add new user card. May return following errors: errors.invalidBillingInformation 422;' +
            ' errors.serviceError 500',
    });
    UserCard.addCard = wrapper(addCard);

    UserCard.remoteMethod('payForLesson', {
        http: { path: '/payForLesson/:lessonId', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'lessonId', type: 'number' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Method for charge user with new card. May return following errors: errors.invalidBillingInformation 422;' +
            ' errors.serviceError 500',
    });
    UserCard.payForLesson = wrapper(payForLesson);

    UserCard.remoteMethod('paymentComplete', {
        http: { path: '/complete/:orderId', verb: 'get' },
        accepts: [
            { arg: 'tap_id', type: 'string' },
            { arg: 'orderId', type: 'string' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Payment system web hook',
    });
    UserCard.paymentComplete = wrapper(processCompletePayment);

    UserCard.remoteMethod('getCards', {
        http: { path: '/', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'UserCards', root: true },
        ],
        description: 'Get user cards. In cards array of {id, lastDigits, default}. May return following errors: errors.serviceError 500.',
    });
    UserCard.getCards = wrapper(getCards);

    UserCard.remoteMethod('deleteCard', {
        http: { path: '/:cardId', verb: 'delete' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'cardId', type: 'number' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Delete user card. May return following errors: errors.cardNotFound 404; errors.serviceError 500.',
    });
    UserCard.deleteCard = wrapper(deleteCard);

    UserCard.remoteMethod('setDefault', {
        http: { path: '/default/:cardId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'cardId', type: 'number' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Set user default card. May return following errors: errors.cardNotFound 404; errors.serviceError 500.',
    });
    UserCard.setDefault = wrapper(setDefaultCard);

    UserCard.remoteMethod('tryPayDebt', {
        http: { path: '/debt/:cardId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'cardId', type: 'number' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Method for trying pay user debt: errors.cardNotFound 404; errors.serviceError 500.',
    });
    UserCard.tryPayDebt = wrapper(tryPayDebt);
};

const defineUserCardsModels = () => {
    app.dataSources.db.define('UserCards', formatDefineFromModel(UserCardsInfoModel));
    app.dataSources.db.define('CardInfo', formatDefineFromModel(CardInfoModel));
};

