'use strict';

const validator = require('./BaseValidation');
const Grade = require('../const/Grade');
const { USERNAME_REGEX, MAX_LAST_NAME, MAX_FIRST_NAME } = require('../const/userProps');
const { PHOTO_MAX_FILE_SIZE, PHOTO_MIME_TYPES } = require('../const/fileProps');

const constraints = {
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
        type: 'string',
        length: {
            minimum: 1,
        },
    },
    university: {
        type: 'string',
        length: {
            minimum: 1,
        },
    },
    city: {
        type: 'string',
        length: {
            minimum: 1,
        },
    },
    lastName: {
        type: 'string',
        length: {
            maximum: MAX_LAST_NAME,
        },
        format: {
            pattern: USERNAME_REGEX,
        },
    },
    grade: {
        type: 'string',
        inclusion: {
            within: Object.values(Grade),
        },
    },
    email: {
        email: true,
    },
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

module.exports = function validatePatchUserData(data) {
    return validator(data, constraints);
};
