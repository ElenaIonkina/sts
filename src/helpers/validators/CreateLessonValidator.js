const validator = require('./BaseValidation');

const MAX_DESCRIPTION_LENGTH = 512;
const Urgency = require('../const/Urgency');

const constraints = {
    description: {
        length: {
            maximum: MAX_DESCRIPTION_LENGTH,
        },
    },
    urgency: {
        inclusion: {
            within: Object.values(Urgency),
        },
    },
    listOfFriends: {
        arrayOf: 'number',
    },
};

module.exports = function validateCreateLessonData(data) {
    return validator(data, constraints);
};

