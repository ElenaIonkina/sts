'use strict';
const wrapper = require('../../src/helpers/createWrapper')('University');
const app = require('../../server/server');
const ValidationError = require('../../src/helpers/errors/validation/ValidationError');

module.exports = function createUniversityModel(University) {
    University.remoteMethod('fetchUniversities', {
        http: { path: '/fetchUniversities', verb: 'get' },
        accepts: [
            { arg: 'country', type: 'string' },
            { arg: 'alphaTwoCode', type: 'string' },
            { arg: 'limit', type: 'number' },
        ],
        returns: [
            { arg: 'schools', type: ['University'], root: true },
            { arg: 'result', type: 'boolean' },
        ],
    });
    University.fetchUniversities = wrapper(fetchUniversities);
};

const fetchUniversities = async (country, alphaTwoCode, limit) => {
    const where = {};
    if (!country && !alphaTwoCode) throw new ValidationError('errors.noCountryAndAlphaTwoCode');
    if (alphaTwoCode) {
        where.alphaTwoCode = String(alphaTwoCode).toUpperCase();
    } else {
        where.country = country;
    }
    return {
        schools: await app.models.University.find({ where, limit }),
        result: true,
    };
};
