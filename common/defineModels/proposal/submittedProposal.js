module.exports = {
    id: Number,
    subject: String,
    description: String,
    timeFrom: Number,
    timeTo: Number,
    urgency: String,
    duration: Number,
    priceInTimeUnit: Number,
    lessonId: Number,
    lessonsPhotos: ['UrlPhoto'],
    languages: [String],
    student: 'UpcomingStudent',

};
