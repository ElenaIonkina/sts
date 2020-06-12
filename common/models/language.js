'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Language');
const getLanguages = require('../methods/language/getLanguages');
const app = require('../../server/server');
const LanguageModel = require('../defineModels/language/LanguageMode');

const validateLanguagesByCodes = require('../staticMethods/language/validateLanguagesByCodes');
const getLanguageByCode = require('../staticMethods/language/getLanguageByCode');
const getLessonsLanguages = require('../staticMethods/language/getLessonsLanguages');
const getTutorsLanguages = require('../staticMethods/language/getTutorsLanguages');
const getTutorLanguages = require('../staticMethods/language/getTutorLanguages');
module.exports = function createLanguageModel(Language) {
    defineLanguageModels();
    Language.remoteMethod('getLanguages', {
        http: { path: '/', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'languages', type: ['LanguageModel'] },
        ],
    });

    Language.getLanguages = wrapper(getLanguages);

    Language.validateLanguagesByCodes = validateLanguagesByCodes;

    Language.getLanguageByCode = getLanguageByCode;

    Language.getLessonsLanguages = getLessonsLanguages;
    Language.getTutorLanguages = getTutorLanguages;
    Language.getTutorsLanguages = getTutorsLanguages;
};

const defineLanguageModels = () => {
    app.dataSources.db.define('LanguageModel', LanguageModel);
};

