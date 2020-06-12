'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Admin');

const login = require('../methods/admin/login');
const checkSession = require('../methods/admin/checkSession');
const logout = require('../methods/admin/logout');
const contactUs = require('../methods/admin/contactUs');

module.exports = function createAdminModel(Admin) {
    Admin.remoteMethod('login', {
        http: { path: '/login', verb: 'post' },
        accepts: [
            { arg: 'res', type: 'object', http: { source: 'res' } },
            { arg: 'email', type: 'string', required: true },
            { arg: 'password', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'boolean', root: true },
        ],

    });
    Admin.login = wrapper(login);

    Admin.remoteMethod('checkSession', {
        http: { path: '/checkSession', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'result', type: 'boolean', root: true },
        ],

    });
    Admin.checkSession = wrapper(checkSession);

    Admin.remoteMethod('logout', {
        http: { path: '/logout', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'result', type: 'boolean', root: true },
        ],

    });
    Admin.logout = wrapper(logout);

    Admin.remoteMethod('contactUs', {
        http: { path: '/contactUs', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'text', type: 'string', required: true },
            { arg: 'grade', type: 'number' },
            { arg: 'university', type: 'string' },
        ],
        returns: [
            { arg: 'result', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],

    });
    Admin.contactUs = wrapper(contactUs);
};
