'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Language');
const app = require('../../server/server');

const postChatMessage = require('../methods/message/postChatMessage');
const postChatPicture = require('../methods/message/postChatPicture');
const getPastMessages = require('../methods/message/getPastMessages');

const PastMessageModel = require('../defineModels/message/PastMessageModel');
const PastMessagesListModel = require('../defineModels/message/PastMessagesListModel');

module.exports = function createMessageModel(Message) {
    defineMessageModels();
    Message.remoteMethod('postChatMessage', {
        http: { path: '/', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'message', type: 'string', required: true },
        ],
        returns: [
            { arg: 'error', type: 'object', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Posts new message to the lesson, may return following errors: errors.userNotInLesson 400, errors.serviceError 500',
    });

    Message.postChatMessage = wrapper(postChatMessage);

    Message.remoteMethod('postChatPicture', {
        http: { path: '/picture', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'error', type: 'object', root: true },
            { arg: 'result', type: 'Result', root: true },
        ],
        description: 'Posts new picture to the lesson, may return following errors: errors.userNotInLesson 400, errors.serviceError 500, Picture is required!!',
    });

    Message.postChatPicture = wrapper(postChatPicture);

    Message.remoteMethod('getPast', {
        http: { path: '/past/:lessonId', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'string' },
        ],
        returns: [
            { arg: 'error', type: 'object', root: true },
            { arg: 'result', type: 'PastMessagesList', root: true },
        ],
        description: 'Returns list of all messages from lesson with id lessonId. May return following errors: errors.lessonNotFound 404, errors.serviceError 500!!',
    });

    Message.getPast = wrapper(getPastMessages);
};

const defineMessageModels = () => {
    app.dataSources.db.define('PastMessagesList', PastMessagesListModel);
    app.dataSources.db.define('PastMessage', PastMessageModel);
};

