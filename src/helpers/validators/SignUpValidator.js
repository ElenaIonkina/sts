'use strict';

const validator = require('./BaseValidation');
const Grade = require('../const/Grade');
const { USERNAME_REGEX, MAX_LAST_NAME, MAX_FIRST_NAME } = require('../const/userProps');
const { MAX_CITY_LENGTH } = require('../const/userBillingProps');

const constraints = {
    deviceToken: {
        length: {
            minimum: 1,
        },
    },
    firstName: {
        type: 'string',
        length: {
            minimum: 1,
            maximum: MAX_FIRST_NAME,
        },
        format: {
            pattern: USERNAME_REGEX,
        },
    },
    country: {
        length: {
            minimum: 1,
        },
    },
    university: {
        length: {
            minimum: 1,
        },
    },
    city: {
        type: 'string',
        length: {
            minimum: 1,
            maximum: MAX_CITY_LENGTH,
        },
    },
    lastName: {
        length: {
            maximum: MAX_LAST_NAME,
        },
        format: {
            pattern: USERNAME_REGEX,
        },
    },
    email: {
        email: true,
    },
    promoCode: {
        type: 'string',
    },
    grade: {
        inclusion: {
            within: Object.values(Grade),
        },
    },
};

module.exports = function validateSignUpData(data) {
    return validator(data, constraints);
};
