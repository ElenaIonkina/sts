const ShortUserInfo = require('./ShortUserInfo');

module.exports = {
    ...ShortUserInfo,
    friend: Boolean,
    languages: [String],
    subjects: [String],
};
