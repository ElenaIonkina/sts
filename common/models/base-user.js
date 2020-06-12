'use strict';
const wrapper = require('../../src/helpers/createWrapper')('BaseUser');
const app = require('../../server/server');
const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');

const signUp = require('../methods/base-user/signUp');
const getUserInfo = require('../methods/base-user/getUserInfo');
const becomeTutor = require('../methods/base-user/becomeTutor');
const fetchListOfUsers = require('../methods/base-user/fetchListOfUsers');
const deleteUserById = require('../methods/base-user/deleteUserById');
const deleteUser = require('../methods/base-user/deleteUser');
const fetchUsersCount = require('../methods/base-user/fetchUsersCount');
const blockUser = require('../methods/base-user/block');
const unblockUser = require('../methods/base-user/unblock');
const logout = require('../methods/base-user/logout');
const patchUser = require('../methods/base-user/patchUser');
const getUserInfoById = require('../methods/base-user/getUserInfoById');
const updateBillingInfo = require('../methods/base-user/updateBillingInfo');

const UserInfoModel = require('../defineModels/base-user/UserInfo');
const TokenInfoModel = require('../defineModels/base-user/TokenInfo');
const FullUserInfoModel = require('../defineModels/base-user/FullUserInfo');
const UserTutorInfoModel = require('../defineModels/base-user/UserTutorInfo');

module.exports = function createBaseUserModel(BaseUser) {
    defineBaseUserModels();
    BaseUser.remoteMethod('signUp', {
        http: { path: '/sign-up', verb: 'post' },
        accepts: [
            { arg: 'deviceToken', type: 'string', required: true },
            { arg: 'firstName', type: 'string', required: true },
            { arg: 'lastName', type: 'any', default: '' },
            { arg: 'email', type: 'any', default: '' },
            { arg: 'country', type: 'string', required: true },
            { arg: 'city', type: 'any', default: '' },
            { arg: 'university', type: 'string', required: true },
            { arg: 'grade', type: 'string', required: true, description: 'Enum: (1-6)' },
            { arg: 'promoCode', type: 'any' },
            { arg: 'phoneNumber', type: 'string', required: true },
            { arg: 'languageCode', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'TokenInfo', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Ends user\'s registration. May return following errors:errors.baseValidation(*fields*) 422, errors.invalidPhone 422, errors.userExists 409, errors.emailExists 409,' +
            'errors.languageNotFound 404, errors.serviceError 500. No id in result!',
    });
    BaseUser.signUp = wrapper(signUp);

    BaseUser.remoteMethod('userInfo', {
        http: { path: '/user-info', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'result', type: 'UserInfo', root: true },
        ],

    });
    BaseUser.userInfo = wrapper(getUserInfo);

    BaseUser.remoteMethod('becomeTutor', {
        http: { path: '/become-tutor', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'email', type: 'string', required: true },
            { arg: 'lastName', type: 'string', required: true },
            { arg: 'subjects', type: ['number'], required: true },
            { arg: 'languages', type: ['string'], required: true },
            { arg: 'photoOfficialTranscript', type: 'file', description: 'IS REQUIRED! IN EXPLORER ONLY FOR TESTING!' },
            { arg: 'photoOfficialId', type: 'file', description: 'IS REQUIRED! IN EXPLORER ONLY FOR TESTING!' },
        ],
        returns: [
            { arg: 'result', type: 'boolean', root: true },
        ],

    });
    BaseUser.becomeTutor = wrapper(becomeTutor);

    BaseUser.remoteMethod('fetchListOfUsers', {
        http: { path: '/users-list', verb: 'get' },
        accepts: [
            { arg: 'page', type: 'number' },
            { arg: 'perPage', type: 'number' },
            { arg: 'tutorStatus', type: 'string' },
            { arg: 'userStatus', type: 'string' },
        ],
        returns: [
            { arg: 'usersList', type: ['object'], root: true },
            { arg: 'totalPages', type: 'number' },
        ],

    });
    BaseUser.fetchListOfUsers = wrapper(fetchListOfUsers);

    BaseUser.remoteMethod('fetchUsersCount', {
        http: { path: '/users-count', verb: 'get' },
        returns: { arg: 'totalCounts', type: 'object', root: true },
    });
    BaseUser.fetchUsersCount = wrapper(fetchUsersCount);

    BaseUser.remoteMethod('deleteUserById', {
        http: { path: '/:id', verb: 'delete' },
        accepts: [
            { arg: 'id', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Admin method for deleting custom user. May return following errors: errors.userNotFound 404; errors.deleteAdmin 403; errors.serviceError 500.',
    });
    BaseUser.deleteUserById = wrapper(deleteUserById);

    BaseUser.remoteMethod('blockUser', {
        http: { path: '/block/:id', verb: 'put' },
        accepts: [
            { arg: 'id', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });
    BaseUser.blockUser = wrapper(blockUser);

    BaseUser.remoteMethod('unblockUser', {
        http: { path: '/unblock/:id', verb: 'put' },
        accepts: [
            { arg: 'id', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });
    BaseUser.unblockUser = wrapper(unblockUser);

    BaseUser.remoteMethod('userLogout', {
        http: { path: '/logout', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Destroy accessToken and deviceToken. May return following errors: errors.serviceError 500. No id in result!',
    });
    BaseUser.userLogout = wrapper(logout);

    BaseUser.remoteMethod('patchUser', {
        http: { path: '/', verb: 'patch' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'firstName', type: 'any' },
            { arg: 'lastName', type: 'any' },
            { arg: 'country', type: 'any' },
            { arg: 'university', type: 'any' },
            { arg: 'grade', type: 'any' },
            { arg: 'email', type: 'any' },
            { arg: 'city', type: 'any' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Update user info, additional argument picture for updating profile photo!!!. May return following errors: errors.emailExists 409, errors.serviceError 500. No id in result!',
    });
    BaseUser.patchUser = wrapper(patchUser);

    BaseUser.remoteMethod('getUserInfoById', {
        http: { path: '/user-info/:id', verb: 'get' },
        accepts: [
            { arg: 'id', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'FullUserInfo', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Admin method for getting full user info. May return following errors: errors.userNotFound 404, errors.serviceError 500. No id in result!',
    });
    BaseUser.getUserInfoById = wrapper(getUserInfoById);

    BaseUser.remoteMethod('deleteUser', {
        http: { path: '/', verb: 'delete' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Method for deleting current user. May return following errors: errors.userNotFound 404; errors.deleteAdmin 403; errors.serviceError 500.',
    });
    BaseUser.deleteUser = wrapper(deleteUser);

    BaseUser.remoteMethod('updateBillingInfo', {
        http: { path: '/billing', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'address', type: 'any' },
            { arg: 'state', type: 'any' },
            { arg: 'city', type: 'any' },
            { arg: 'postalCode', type: 'any' },
        ],
        returns: [
            { arg: 'result', type: 'UserInfo', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Method for updating user billing info. Max address: 40, max city 50, max postalCode 20, max state 30.' +
            ' May return following errors: errors.invalidState, errors.invalidPostalCode 422; errors.deleteAdmin 403; errors.serviceError 500.',
    });
    BaseUser.updateBillingInfo = wrapper(updateBillingInfo);
};

const defineBaseUserModels = () => {
    app.dataSources.db.define('UserInfo', formatDefineFromModel(UserInfoModel));
    app.dataSources.db.define('TokenInfo', formatDefineFromModel(TokenInfoModel));
    app.dataSources.db.define('UserTutorInfo', formatDefineFromModel(UserTutorInfoModel));
    app.dataSources.db.define('FullUserInfo', formatDefineFromModel(FullUserInfoModel));
};
