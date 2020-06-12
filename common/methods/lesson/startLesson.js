const getSocketByBaseUserId = require('../../../src/helpers/getSocketByBaseUserId');

const { sendStartCallEvent } = require('../../../socket/controllers/calls');

const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const UserSocketNotFound = require('../../../src/helpers/errors/notFound/UserSocketNotFound');
const SelectedTutorNotFound = require('../../../src/helpers/errors/notFound/SelectedTutorNotFound');
const { Later } = require('../../../src/helpers/const/Urgency');
const { DEBTOR } = require('../../../src/helpers/const/userRoles');

module.exports = async function startLesson(req, proposalId) {
    const { userId } = req.accessToken;
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) {
        throw new UserSocketNotFound();
    }
    const proposal = await this.app.models.Proposal.findById(proposalId, {
        where: {
            id: proposalId,
        },
        include: [{
            relation: 'lesson',
            scope: {
                include: [{
                    relation: 'baseUser',
                    scope: {
                        include: 'avatar',
                    },
                }],
            },
        },
        {
            relation: 'tutor',
            scope: {
                include: 'baseUser',
            },
        },
        ],
    });
    if (!proposal) {
        throw new LessonNotFoundError();
    }
    const proposalJson = proposal.toJSON();
    const isProposalNotFound = isProposalValid(proposalJson, userId);
    if (isProposalNotFound) {
        throw new LessonNotFoundError();
    }

    if ((proposalJson.lesson.urgency === Later && !proposalJson.selected) || !proposalJson.tutorId) {
        throw new SelectedTutorNotFound();
    }

    if (proposalJson.tutor.baseUser.role === DEBTOR)
        return {
            result: {
                success: true,
            },
        };

    const { baseUser } = proposalJson.lesson;
    const { avatar } = baseUser;
    await sendStartCallEvent({
        id: baseUser.id,
        tutorId: proposalJson.tutor.baseUserId,
        lessonId: proposal.lessonId,
        lastName: baseUser.lastName,
        grade: Number(baseUser.grade),
        avatarUrl: avatar && avatar.originalUrl || null,
        firstName: baseUser.firstName,
        university: baseUser.university,
        studentId: userId,
    });

    return {
        result: {
            success: true,
        },
    };
};

function isProposalValid(proposal, userId) {
    return !proposal.lesson || proposal.lesson.startTime || proposal.lesson.finished ||
        !proposal.lesson.baseUser || proposal.lesson.baseUserId !== userId;
}
