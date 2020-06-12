const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const UserRoles = require('../../../src/helpers/const/userRoles');

const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const clearTutorProposals = require('../../staticMethods/baseUser/clearTutorProposals');

module.exports = async function disableTutor(userId) {
    await runMySQLTransactions(async (models) => {
        const [tutor, user] = await Promise.all([
            models.Tutor.findOne({ where: { baseUserId: userId } }),
            models.BaseUser.findById(userId),
        ]);
        if (!tutor || !user || user.deletedAt) {
            throw new UserNotFoundError();
        }
        tutor.status = TutorRequestStatus.Rejected;
        user.role = UserRoles.STUDENT;
        await Promise.all([
            user.save(),
            tutor.save(),
            clearTutorProposals(models, user.id),
        ]);
    });
    return { success: true };
};
