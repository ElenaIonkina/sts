module.exports = {
    id: Number,
    subject: String,
    description: String,
    timeFrom: Number,
    timeTo: Number,
    urgency: String,
    duration: Number,
    role: String,
    proposal: 'UpcomingProposal',
    student: 'UpcomingStudent',
    languages: [String],
};
