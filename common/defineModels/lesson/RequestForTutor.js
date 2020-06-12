const Photo = require('../image/Photo');
module.exports = {
    id: Number,
    subject: String,
    description: String,
    urgency: String,
    grade: String,
    university: String,
    priceInTimeUnit: String,
    lessonPhotos: [Photo],
    proposals: [Object],
    languages: [String],
    timeFrom: Number,
    timeTo: Number,
    duration: Number,
    student: {
        id: Number,
        firstName: String,
        lastName: String,
        photo: Photo,
    },
};
