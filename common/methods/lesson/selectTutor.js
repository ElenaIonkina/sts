const _ = require('lodash');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const ProposalNotFoundError = require('../../../src/helpers/errors/notFound/ProposalNotFound');
const WrongLessonUrgencyError = require('../../../src/helpers/errors/WrongLessonUrgency');

const URGENCY = require('../../../src/helpers/const/Urgency');
const UserStatus = require('../../../src/helpers/const/UserStatus');
const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');

module.exports = async function selectTutor(req, proposalId) {
    const userId = _.get(req, 'accessToken.userId');
    const getProposalQuery = ` SELECT Lesson.baseUserId, Proposal.id, Lesson.urgency, Proposal.selected, Proposal.lessonId,
                                    Tutor.status AS tutorStatus, BaseUser.deletedAt AS tutorDeletedAt, BaseUser.userStatus
                               FROM tutoring.Lesson INNER JOIN tutoring.Proposal ON Lesson.id = Proposal.lessonId
                                    INNER JOIN tutoring.Tutor ON Proposal.tutorId = Tutor.id
                                    INNER JOIN tutoring.BaseUser ON Tutor.baseUserId = BaseUser.id
                               WHERE Proposal.id = ${proposalId} LIMIT 1`;
    const [proposal] = await runMySQLQuery(getProposalQuery);
    const isProposalNotFound = isProposalValid(proposal, userId);
    if (isProposalNotFound) {
        throw new ProposalNotFoundError();
    }
    if (proposal.urgency === URGENCY.Now) {
        throw new WrongLessonUrgencyError();
    }
    if (!proposal.selected) {
        await runMySQLTransactions(async (models) => {
            await models.Proposal.updateAll({ lessonId: proposal.lessonId }, { selected: 0 });
            await models.Proposal.updateAll({ id: proposalId }, { selected: 1 });
        });
    }
    return {
        success: true,
    };
};

function isProposalValid(proposal, baseUserId) {
    return !proposal || proposal.baseUserId !== baseUserId || proposal.tutorStatus !== TutorRequestStatus.Accepted ||
        proposal.userStatus === UserStatus.Blocked || proposal.tutorDeletedAt;
}
