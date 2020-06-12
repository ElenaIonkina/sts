'use strict';

const validator = require('./BaseValidation');
const { MAX_CITY_LENGTH, MAX_ADDRESS_LENGTH, MAX_POSTAL_LENGTH, MAX_STATE_LENGTH } = require('../const/userBillingProps');

const constraints = {
    address: {
        type: 'string',
        length: {
            maximum: MAX_ADDRESS_LENGTH,
        },
    },
    city: {
        type: 'string',
        length: {
            maximum: MAX_CITY_LENGTH,
        },
    },
    state: {
        type: 'string',
        length: {
            maximum: MAX_STATE_LENGTH,
        },
    },
    postalCode: {
        type: 'string',
        length: {
            maximum: MAX_POSTAL_LENGTH,
        },
    },
};

module.exports = function validateBillingData(data) {
    return validator(data, constraints);
};
