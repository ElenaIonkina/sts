'use strict';
const app = require('../../server/server');
const wrapper = require('../../src/helpers/createWrapper')('Subject');

const SubjectModel = require('../defineModels/subject/SubjectModel');
const SubjectsModel = require('../defineModels/subject/SubjectsModel');

const getSubjects = require('../methods/subject/getSubjects');
const validateSubjectsById = require('../staticMethods/subject/validateSubjectsById');
const getTutorsSubjects = require('../staticMethods/subject/getTutorsSubjects');

module.exports = function createSubjectModel(Subject) {
    defineSubjectModels();
    Subject.remoteMethod('getSubjects', {
        http: { path: '/', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'subjects', type: 'SubjectsModel', root: true },
        ],
    });

    Subject.getSubjects = wrapper(getSubjects);

    Subject.validateSubjectsById = validateSubjectsById;

    Subject.getTutorsSubjects = getTutorsSubjects;
};

const defineSubjectModels = () => {
    app.dataSources.db.define('SubjectModel', SubjectModel);
    app.dataSources.db.define('SubjectsModel', SubjectsModel);
};

