const Photo = require('../image/Photo');

module.exports = {
    subject: String,
    urgency: String,
    priceInTimeUnit: Number,
    finished: Boolean,
    type: String,
    timeTo: Number,
    timeFrom: Number,
    duration: Number,
    languages: [String],
    isPublicRequest: {
        constructor: Boolean,
        dbName: 'isPublic',
    },
    countWatch: Number,
    countProposals: Number,
    lessonPhotos: [Photo],
    discount: String,
    listOfFriends: [Object],
    id: Number,
    createdOn: String,
};
