'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Friend');
const app = require('../../server/server');

const addFriend = require('../methods/friend/addFriend');
const removeFriend = require('../methods/friend/removeFriend');
const getFriendsList = require('../methods/friend/getFriendsList');

const TutorFriendModel = require('../defineModels/friend/TutorFriend');
const TutorFriendsListModel = require('../defineModels/friend/TutorFriendsList');

module.exports = function createLanguageModel(Friend) {
    defineFriendModel();
    Friend.remoteMethod('addFriend', {
        http: { path: '/add/:friendId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'friendId', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Add user with friendId to friends. May return following errors: errors.userNotFound 404; errors.serviceError 500',
    });

    Friend.addFriend = wrapper(addFriend);

    Friend.remoteMethod('removeFriend', {
        http: { path: '/remove/:friendId', verb: 'delete' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'friendId', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Removes friend user with friendId from friends. May return following errors: errors.friendNotFound 404; errors.serviceError 500',
    });

    Friend.removeFriend = wrapper(removeFriend);

    Friend.remoteMethod('getFriendsList', {
        http: { path: '/list', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'result', type: 'TutorFriendsList', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Returns current friends list with tutor info. NO ID IN RESULT!!! May return following errors: errors.serviceError 500',
    });

    Friend.getFriendsList = wrapper(getFriendsList);
};

const defineFriendModel = () => {
    app.dataSources.db.define('TutorFriendsList', TutorFriendsListModel);
    app.dataSources.db.define('TutorFriend', TutorFriendModel);
};

