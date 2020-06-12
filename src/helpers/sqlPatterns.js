const { Blocked } = require('./const/UserStatus');
const { Accepted } = require('./const/TutorRequestStatus');

function getBaseUserNotBlockedAndNotDeletedQuery(userTable = 'BaseUser') {
    return `${userTable}.deletedAt IS NULL AND ${userTable}.userStatus != '${Blocked}'`;
}

function getTutorAcceptedQuery(tutorTable = 'Tutor') {
    return `${tutorTable}.status = '${Accepted}'`;
}

module.exports = {
    getBaseUserNotBlockedAndNotDeletedQuery,
    getTutorAcceptedQuery,
};
