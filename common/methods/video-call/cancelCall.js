const getSocketByBaseUserId = require('../../../src/helpers/getSocketByBaseUserId');

const { sendCancelCallEvent } = require('../../../socket/controllers/calls');
const { getCallRequest, dropCallRequest } = require('../../../src/datasource/redis/endpoints/callRequests');

const ProposalNotFoundError = require('../../../src/helpers/errors/notFound/ProposalNotFound');
const UserSocketNotFound = require('../../../src/helpers/errors/notFound/UserSocketNotFound');

module.exports = async function cancelCall(req, proposalId) {
    const { userId } = req.accessToken;
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) {
        throw new UserSocketNotFound();
    }

    const proposal = await this.app.models.Proposal.findById(proposalId);
    if (!proposal) {
        throw new ProposalNotFoundError();
    }

    const callRequest = await getCallRequest(proposal.lessonId);
    if (!callRequest || callRequest.studentId !== userId) {
        throw new ProposalNotFoundError();
    }

    sendCancelCallEvent({
        lessonId: proposal.lessonId,
        tutorId: callRequest.tutorId,
        studentId: userId.studentId,
    });

    await dropCallRequest(proposal.lessonId);

    return {
        result: {
            success: true,
        },
    };
};
