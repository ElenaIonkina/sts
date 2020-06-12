'use strict';

const validator = require('./BaseValidation');
const { PHOTO_MAX_FILE_SIZE, PHOTO_MIME_TYPES } = require('../const/fileProps');
const Grade = require('../const/Grade');

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
    grade: {
        inclusion: {
            within: Object.values(Grade),
        },
    },
};

module.exports = function validateContactUsData(data) {
    return validator(data, constraints);
};
