'use strict';

const validator = require('./BaseValidation');

const constraints = {
    grade: {
        numericality: {
            onlyInteger: true,
            greaterThan: 0,
            lessThan: 200,
        },
    },
};

module.exports = function validatePutTutorSettingsData(data) {
    return validator(data, constraints);
};
