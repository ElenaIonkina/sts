module.exports = {
    id: Number,
    subject: String,
    description: String,
    duration: Number,
    urgency: String,
    grade: Number,
    startTime: Number,
    university: String,
    priceInTimeUnit: Number,
    lessonPhotos: ['UrlPhoto'],
    proposals: ['FetchRequestProposal'],
    languages: [String],
    student: 'ShortUserInfo',
    tutor: 'ShortUserTutorInfo',
    sharedUsers: ['SharedUserInfo'],
    recordingRelativeUrl: String,
};
