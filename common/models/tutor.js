'use strict';

const app = require('../../server/server');

const wrapper = require('../../src/helpers/createWrapper')('Tutor');
const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');
const TutorRequestStatus = require('../../src/helpers/const/TutorRequestStatus');

const getBecomeTutorStatus = require('../methods/tutor/getBecomeTutorStatus');
const enableTutor = require('../methods/tutor/enableTutor');
const disableTutor = require('../methods/tutor/disableTutor');
const putSettings = require('../methods/tutor/putSettings');

const StatusModel = require('../defineModels/tutor/Status');

module.exports = function createTutorModel(Tutor) {
    defineTutorModels();
    Tutor.remoteMethod('getBecomeTutorStatus', {
        http: { path: '/status', verb: 'get' },
        description: `Return status "become tutor" request: Enum(${Object.values(TutorRequestStatus).join('|')})`,
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
        ],
        returns: [
            { arg: 'status', type: 'StatusModel', root: true },
        ],

    });
    Tutor.getBecomeTutorStatus = wrapper(getBecomeTutorStatus);

    Tutor.remoteMethod('enableTutor', {
        http: { path: '/enableTutor/:userId', verb: 'put' },
        description: 'Enables user\'s tutor features',
        accepts: [
            { arg: 'userId', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });
    Tutor.enableTutor = wrapper(enableTutor);

    Tutor.remoteMethod('disableTutor', {
        http: { path: '/disableTutor/:userId', verb: 'put' },
        description: 'Disables user\'s tutor features',
        accepts: [
            { arg: 'userId', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });
    Tutor.disableTutor = wrapper(disableTutor);

    Tutor.remoteMethod('putSettings', {
        http: { path: '/settings/:tutorId', verb: 'put' },
        accepts: [
            { arg: 'tutorId', type: 'number', required: true },
            { arg: 'subjects', type: ['number'], required: true },
            { arg: 'languages', type: ['number'], required: true },
            { arg: 'grade', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Admin method for putting new subjects and languages for tutor. May return following errors: errors.subjectNotFound, errors.languageNotFound, errors.userNotFound 404' +
            'errors.serviceError 500.',
    });
    Tutor.putSettings = wrapper(putSettings);
};

const defineTutorModels = () => {
    app.dataSources.db.define('StatusModel', formatDefineFromModel(StatusModel));
};
