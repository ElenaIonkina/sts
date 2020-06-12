const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const UserRoles = require('../../../src/helpers/const/userRoles');

const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function enableTutor(userId) {
    await runMySQLTransactions(async (models) => {
        const [tutor, user] = await Promise.all([
            models.Tutor.findOne({ where: { baseUserId: userId } }),
            models.BaseUser.findById(userId),
        ]);
        if (!tutor || !user || user.deletedAt) {
            throw new UserNotFoundError();
        }
        tutor.status = TutorRequestStatus.Accepted;
        user.role = UserRoles.TUTOR;
        await Promise.all([
            user.save(),
            tutor.save(),
        ]);
    });
    return { success: true };
};
