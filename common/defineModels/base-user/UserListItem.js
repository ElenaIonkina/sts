module.exports = {
    firstName: String,
    lastName: String,
    country: String,
    email: String,
    city: String,
    university: String,
    userStatus: String,
    grade: String,
    tutorStatus: {
        constructor: String,
        dbName: 'status',
    },
    id: Number,
};
