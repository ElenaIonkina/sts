'use strict';

const validator = require('./BaseValidation');
const Ranges = require('../const/PastLessonsRanges');

const constraints = {
    range: {
        inclusion: {
            within: Object.values(Ranges),
        },
    },
};

module.exports = function validateGetPastLessonsData(data) {
    return validator(data, constraints);
};
