'use strict';

const validator = require('./BaseValidation');
const { PHOTO_MAX_FILE_SIZE, PHOTO_MIME_TYPES } = require('../const/fileProps');

const constraints = {
    size: {
        numericality: {
            greaterThan: 0,
            lessThanOrEqualTo: PHOTO_MAX_FILE_SIZE,
        },
    },
    mimetype: {
        inclusion: {
            within: Object.values(PHOTO_MIME_TYPES),
        },
    },
};

module.exports = function validateSignUpData(data) {
    return validator(data, constraints);
};
