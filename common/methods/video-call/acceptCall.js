const moment = require('moment');
const getSocketByBaseUserId = require('../../../src/helpers/getSocketByBaseUserId');

const { sendAcceptCallEvent } = require('../../../socket/controllers/calls');
const { getCallRequest, dropCallRequest } = require('../../../src/datasource/redis/endpoints/callRequests');
const scheduleSendLessonQuarterEndEvent = require('../../../src/tasksScheduler/schedulers/sendLessonQuarterEndScheduler');
const scheduleDropCall = require('../../../src/tasksScheduler/schedulers/dropCallScheduler');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const UserSocketNotFound = require('../../../src/helpers/errors/notFound/UserSocketNotFound');

const LessonPriceInDollars = require('../../../src/helpers/const/LessonPriceInDollars');
const Grade = require('../../../src/helpers/const/Grade');

module.exports = async function acceptCall(req, lessonId) {
    const { userId } = req.accessToken;
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) {
        throw new UserSocketNotFound();
    }

    const callRequest = await getCallRequest(lessonId);
    if (!callRequest || callRequest.tutorId !== userId) {
        throw new LessonNotFoundError();
    }

    await runMySQLTransactions(async (models) => {
        const [lesson, tutor] = await Promise.all([
            models.Lesson.findById(lessonId, { include: 'baseUser' }),
            models.Tutor.findOne({ where: { baseUserId: userId }, include: 'baseUser' }),
            dropCallRequest(lessonId),
            sendAcceptCallEvent({
                lessonId,
                tutorId: callRequest.tutorId,
                studentId: callRequest.studentId,
            }),
        ]);
        const tutorGrade = tutor.baseUser().grade;
        const userGrade = lesson.baseUser().grade;
        lesson.priceInTimeUnitInDollars = userGrade.toString() === Grade.eighthSchool
            ? LessonPriceInDollars[Grade.eighthSchool]
            : LessonPriceInDollars[tutorGrade];
        lesson.tutorId = tutor.id;
        lesson.startTime = moment().unix();
        await Promise.all([
            lesson.save(),
            scheduleSendLessonQuarterEndEvent(models, lesson.duration, callRequest.studentId, callRequest.tutorId, lessonId),
            scheduleDropCall(models, lesson.startTime, lesson.duration, callRequest.studentId, callRequest.tutorId, lesson.id),
        ]);
    });
    return {
        result: {
            success: true,
        },
    };
};
