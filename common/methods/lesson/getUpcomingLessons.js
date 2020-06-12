const _ = require('lodash');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const LESSON_ROLES = require('../../../src/helpers/const/LessonRoles');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const { getTutorAcceptedQuery, getBaseUserNotBlockedAndNotDeletedQuery } = require('../../../src/helpers/sqlPatterns');
const TUTOR_ACCEPTED_QUERY = getTutorAcceptedQuery('tutor');
const STUDENT_NOT_BLOCKED_AND_DELETED = getBaseUserNotBlockedAndNotDeletedQuery('lessonUser');
const TUTOR_NOT_BLOCKED_AND_DELETED = getBaseUserNotBlockedAndNotDeletedQuery('tutorUser');

module.exports = async function getUpcomingLessons(req) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId);
    const query = ` SELECT Lesson.id, Lesson.description, Lesson.timeFrom, Lesson.timeTo, tutorUser.city AS tutorCity, tutorUser.country AS tutorCountry,
                        Lesson.urgency, Lesson.duration, Lesson.baseUserId, SubjectTranslation.translation AS subject, tutor.id AS tutorId,
                        tutorUser.lastName AS tutorLastName, tutorUser.firstName AS tutorFirstName, tutorUser.university AS tutorUniver,
                        tutorUser.grade AS tutorGrade, tutorPhoto.originalUrl AS tutorOriginalPhoto, tutorPhoto.previewUrl AS tutorPreviewPhoto,
                        tutorUser.id AS tutorUserId, Proposal.id AS proposalId, lessonUser.lastName AS baseUserLastName, lessonUser.firstName AS baseUserFirstName,
                        lessonUser.grade AS studentGrade, lessonUser.university AS studentUniversity,
                        userPhoto.originalUrl AS userOriginalPhoto, userPhoto.previewUrl AS userPreviewPhoto, lessonUser.id AS baseUserId,
                        (SELECT (SUM(rate)/COUNT(id)) FROM tutoring.LessonRating WHERE lessonId IN (SELECT Lesson.id FROM tutoring.Lesson WHERE Lesson.finished = 1 AND Lesson.tutorId = Proposal.tutorId)) AS rating
                    FROM tutoring.Lesson
                        INNER JOIN tutoring.Proposal ON Lesson.id = Proposal.lessonId
                        INNER JOIN tutoring.Tutor AS tutor ON Proposal.tutorId = tutor.id
                        INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                        INNER JOIN tutoring.BaseUser AS tutorUser ON tutor.baseUserId = tutorUser.id
                        LEFT JOIN tutoring.Photo AS tutorPhoto ON tutorUser.avatarId = tutorPhoto.id
                        INNER JOIN tutoring.BaseUser AS lessonUser ON Lesson.baseUserId = lessonUser.id
                        LEFT JOIN tutoring.Photo AS userPhoto ON lessonUser.avatarId = userPhoto.id
                        INNER JOIN tutoring.TransactionInfo ON Lesson.id = TransactionInfo.lessonId
                    WHERE SubjectTranslation.languageId = ${user.languageId} AND Proposal.selected = 1 AND (Lesson.baseUserId = ${user.id} OR tutor.baseUserId = ${user.id})
                        AND Lesson.expiredAt IS NULL AND ${TUTOR_ACCEPTED_QUERY} AND ${STUDENT_NOT_BLOCKED_AND_DELETED} AND ${TUTOR_NOT_BLOCKED_AND_DELETED}
                        AND TransactionInfo.transactionId IS NOT NULL
                        AND Lesson.tutorId IS NULL AND Lesson.startTime IS NULL AND Lesson.finished = 0`;
    const lessons = await runMySQLQuery(query);
    const tutorIds = lessons.map(l => l.tutorId);
    const lessonsIds = lessons.map(l => l.id);
    const [lessonLanguages, tutorSubjects, tutorLanguages, lessonPhotos, friends] = await Promise.all([
        this.app.models.Language.getLessonsLanguages(lessonsIds, user.languageId),
        this.app.models.Subject.getTutorsSubjects(tutorIds, user.languageId),
        this.app.models.Language.getTutorsLanguages(tutorIds, user.languageId),
        this.app.models.LessonPhoto.find({ where: { lessonId: { inq: lessonsIds } } }),
        this.app.models.Friend.find({ where: { userId: user.id } }),
    ]);
    return {
        upcomingLessons: toDto(lessons, user.id, lessonLanguages, tutorSubjects, tutorLanguages, lessonPhotos, friends),
        totalCount: lessons.length,
    };
};

function toDto(lessons, userId, lessonLanguages, tutorSubjects, tutorLanguages, lessonPhotos, friends) {
    return lessons.map(l => {
        return {
            id: l.id,
            subject: l.subject,
            description: l.description,
            timeFrom: l.timeFrom,
            timeTo: l.timeTo,
            urgency: l.urgency,
            duration: l.duration,
            role: l.baseUserId === userId ? LESSON_ROLES.study : LESSON_ROLES.teach,
            proposal: {
                lastName: l.tutorLastName,
                firstName: l.tutorFirstName,
                city: l.tutorCity,
                country: l.tutorCountry,
                university: l.tutorUniver,
                rating: Math.round(l.rating || 0),
                grade: Number(l.tutorGrade),
                photo: getPhoto(l.tutorOriginalPhoto, l.tutorPreviewPhoto),
                id: l.tutorUserId,
                proposalId: l.proposalId,
                friend: Boolean(friends.find(f => f.friendId === l.tutorUserId)),
                languages: tutorLanguages.filter(lang => lang.tutorId === l.tutorId).map(lang => lang.translation),
                subjects: tutorSubjects.filter(s => s.tutorId === l.tutorId).map(s => s.translation),
            },
            languages: lessonLanguages
                .filter(lang => lang.lessonId === l.id)
                .map(lang => lang.translation),
            student: {
                lastName: l.baseUserLastName,
                firstName: l.baseUserFirstName,
                photo: getPhoto(l.userOriginalPhoto, l.userPreviewPhoto),
                id: l.baseUserId,
                grade: Number(l.studentGrade),
                university: l.studentUniversity,
            },
            photos: lessonPhotos.filter(p => p.lessonId === l.id).map(p => (
                {
                    originalUrl: storagePaths.getPicturePath() + p.originalUrl,
                    previewUrl: storagePaths.getPicturePath() + p.previewUrl,
                })
            ),
        };
    });
}

function getPhoto(originalUrl, previewUrl) {
    let picturePath = storagePaths.getPicturePath();
    if (originalUrl && previewUrl)
        return {
            previewUrl: (picturePath + previewUrl),
            originalUrl: (picturePath + originalUrl),
        };
    return null;
}
