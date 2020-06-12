const _ = require('lodash');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const lessonTypes = require('../../../src/helpers/const/lessonTypes');
const Urgency = require('../../../src/helpers/const/Urgency');
const { Blocked } = require('../../../src/helpers/const/UserStatus');
const { Accepted } = require('../../../src/helpers/const/TutorRequestStatus');

module.exports = async function fetchRequests(req, limit) {
    const user = await this.app.models.BaseUser.findById(_.get(req, 'accessToken.userId'));

    const nowRequests = await getRequests(limit, user.languageId, user.id, 'Lesson.createdOn ASC', Urgency.Now);

    const laterRequests = !limit || limit - nowRequests.length > 0
        ? await getRequests(limit - nowRequests.length, user.languageId, user.id, 'timeFrom ASC', Urgency.Later) : [];
    const requests = nowRequests.concat(laterRequests);

    return {
        sentRequests: requests,
        totalCount: requests.length,
    };
};

async function getRequests(limit, languageId, userId, orderBy, urgency) {
    const lessonsQuery = `SELECT Lesson.id, SubjectTranslation.translation as subject, Lesson.description,
                            Lesson.description, Lesson.timeFrom, Lesson.timeTo, Lesson.urgency, Lesson.countWatch
                          FROM tutoring.Lesson INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                                               INNER JOIN tutoring.TransactionInfo ON Lesson.id = TransactionInfo.lessonId
                          WHERE Lesson.baseUserId = ${userId} AND Lesson.type = '${lessonTypes.REQUEST}'
                            AND Lesson.urgency = '${urgency}' AND SubjectTranslation.languageId = ${languageId} AND Lesson.finished = 0
                            AND Lesson.startTime IS NULL AND Lesson.tutorId IS NULL AND Lesson.expiredAt IS NULL
                            AND TransactionInfo.transactionId iS NOT NULL
                            AND NOT EXISTS(SELECT Proposal.id FROM tutoring.Proposal WHERE Proposal.lessonId = Lesson.id AND Proposal.selected = 1)
                          ORDER BY ${orderBy}
                          ${limit ? `LIMIT ${limit}` : ''}`;
    const lessons = await runMySQLQuery(lessonsQuery);
    const lessonsIds = `(${lessons.map(l => l.id).join(',')})`;
    const proposalsQuery = `SELECT Proposal.lessonId AS lessonId, BaseUser.id, BaseUser.firstName, BaseUser.lastName,
                                BaseUser.grade, BaseUser.university, Proposal.id AS proposalId, Photo.previewUrl, Photo.originalUrl,
                                (SELECT (SUM(rate)/COUNT(id)) FROM tutoring.LessonRating WHERE lessonId IN (SELECT Lesson.id FROM tutoring.Lesson WHERE Lesson.finished = 1 AND Lesson.tutorId = Proposal.tutorId)) AS rating
                            FROM tutoring.Proposal INNER JOIN tutoring.Tutor ON Proposal.tutorId = Tutor.id
                                INNER JOIN tutoring.BaseUser ON Tutor.baseUserId = BaseUser.id
                                LEFT JOIN tutoring.Photo ON BaseUser.avatarId = Photo.id
                            WHERE Proposal.lessonId IN ${lessonsIds} AND BaseUser.deletedAt IS NULL
                                AND BaseUser.userStatus != '${Blocked}' AND Tutor.status = '${Accepted}'`;
    console.error(proposalsQuery);
    const proposals = lessons.length ? await runMySQLQuery(proposalsQuery) : [];
    return lessons.map(l => {
        const lesson = {
            ...l,
            proposals: proposals.filter(p => p.lessonId === l.id).map(p => {
                const photo = p.originalUrl && p.previewUrl ? {
                    originalUrl: storagePaths.getPicturePath() + p.originalUrl,
                    previewUrl: storagePaths.getPicturePath() + p.previewUrl,
                } : null;
                return {
                    id: p.id,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    grade: Number(p.grade),
                    rating: Math.round(p.rating || 0),
                    university: p.university,
                    photo,
                    proposalId: p.proposalId,
                };
            }),
        };
        lesson.countProposals = lesson.proposals.length;
        return lesson;
    });
}
