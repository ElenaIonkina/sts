module.exports = {
    id: Number,
    subject: String,
    description: String,
    timeFrom: Number,
    timeTo: Number,
    countWatch: Number,
    countProposals: Number,
    urgency: String,
    proposals: ['FetchRequestProposal'],
};
