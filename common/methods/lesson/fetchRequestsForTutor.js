const _ = require('lodash');
const urgencyTypes = require('../../../src/helpers/const/Urgency');
const lessonTypes = require('../../../src/helpers/const/lessonTypes');
const { Blocked } = require('../../../src/helpers/const/UserStatus');
const parseForTutor = require('../../../src/helpers/formaters/parseRequest').parseForTutor;
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

// mysql group concat limit by default = 1024 => error when a lot of photos
const SET_GROUP_CONCAT_LIMIT_QUERY =  'SET @@group_concat_max_len = 100000000;';

module.exports = async function fetchRequestsForTutor(req, subjects, urgency, limit) {
    const user = await this.app.models.BaseUser.findById(_.get(req, 'accessToken.userId'));
    const tutor = await user.tutor.get();
    const tutorLanguages = (await runMySQLQuery(`
                                SELECT LanguageTranslation.translation
                                FROM TutorLanguage INNER JOIN LanguageTranslation ON TutorLanguage.languageId = LanguageTranslation.languageId
                                WHERE TutorLanguage.tutorId = ${tutor.id} AND LanguageTranslation.translationLanguageId = ${user.languageId}`))
        .map(l => l.translation);
    await runMySQLQuery(SET_GROUP_CONCAT_LIMIT_QUERY);
    const lessonSubject = subjects && subjects.length ? `(${subjects.join(',')})` : null;
    const result = await runMySQLQuery(createDBQuery(user.grade, lessonSubject, urgency, limit, tutor.id, user.languageId, user.id)) || [];
    const dto = result.filter(r => r.languages && JSON.parse(r.languages)
        .filter(l => tutorLanguages.includes(l)).length)
        .map(parseForTutor);
    return {
        requests: dto,
        totalCount: dto.length,
    };
};

const createDBQuery = (grade, subjects, urgency, limit, tutorId, languageId, userId) => {
    return `SELECT Lesson.id,
                   Lesson.description,
                   Lesson.duration,
                   Lesson.timeTo,
                   Lesson.timeFrom,
                   SubjectTranslation.translation as 'subjectName',
                   Lesson.duration,
                   Lesson.urgency,
                   BaseUser.grade,
                   BaseUser.university,
                   Lesson.priceInTimeUnitInDollars,
                   BaseUser.id  as 'baseUserId',
                   BaseUser.firstName,
                   BaseUser.lastName,
                   Photo.originalUrl,
                   Photo.previewUrl,
                   CONCAT('[',
                          (SELECT group_concat(concat('"', LanguageTranslation.translation, '"') separator ',') FROM LanguageTranslation
                          WHERE LanguageTranslation.languageId IN (SELECT LessonLanguage.languageId FROM LessonLanguage WHERE LessonLanguage.lessonId = Lesson.id)
                          AND LanguageTranslation.translationLanguageId = ${languageId}), ']'
                         ) AS languages,
                   CONCAT(
                       '[',
                       GROUP_CONCAT(
                           IF(LessonPhoto.originalUrl IS NULL, '', JSON_OBJECT(
                                   'originalUrl', LessonPhoto.originalUrl,
                                   'previewUrl', LessonPhoto.previewUrl
                               ))

                       ),
                       ']'
                   )        AS lessonPhotos
            FROM Lesson
                     INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                     INNER JOIN BaseUser ON BaseUser.id = Lesson.baseUserId
                     LEFT JOIN Photo ON BaseUser.avatarId = Photo.id
                     LEFT JOIN FriendsLessons ON FriendsLessons.lessonId = Lesson.id
                     LEFT JOIN LessonPhoto ON LessonPhoto.lessonId = Lesson.id
                     INNER JOIN tutoring.Subject AS lessonSubject ON Lesson.subjectId = lessonSubject.id
                     INNER JOIN tutoring.TransactionInfo ON Lesson.id = TransactionInfo.lessonId
           WHERE (Lesson.isPublic = true OR FriendsLessons.friendUserId = ${userId}
                    OR (NOT EXISTS (SELECT FriendsLessons.lessonId FROM tutoring.FriendsLessons WHERE FriendsLessons.lessonId = Lesson.id)
                        AND EXISTS (SELECT Friend.id FROM tutoring.Friend WHERE Friend.userId = Lesson.baseUserId AND Friend.friendId = ${userId})))
              AND Lesson.type = '${lessonTypes.REQUEST}' AND Lesson.finished = 0
              ${urgency ? `AND Lesson.urgency = '${urgency}'` : ''}
              AND TransactionInfo.transactionId IS NOT NULL
              AND BaseUser.grade < ${grade}
              AND SubjectTranslation.languageId = ${languageId}
              AND BaseUser.deletedAt IS NULL AND BaseUser.userStatus != '${Blocked}' AND Lesson.startTime IS NULL
              AND Lesson.tutorId IS NULL AND Lesson.expiredAt IS NULL
              AND NOT EXISTS(SELECT Proposal.id FROM tutoring.Proposal WHERE Proposal.lessonId = Lesson.id AND (Proposal.selected = 1 OR Proposal.tutorId = ${tutorId}))
              AND EXISTS(SELECT TutorSubject.id
                         FROM tutoring.TutorSubject
                            INNER JOIN tutoring.Subject AS tutorSubject ON TutorSubject.subjectId = tutorSubject.id
                         WHERE TutorSubject.tutorId = ${tutorId}
                            AND (tutorSubject.id = lessonSubject.id
                                OR (tutorSubject.baseSubjectId IS NOT NULL AND (tutorSubject.baseSubjectId = lessonSubject.baseSubjectId OR tutorSubject.baseSubjectId = lessonSubject.id)
                                    AND tutorSubject.level >= lessonSubject.level))
                            ${subjects ? `AND TutorSubject.subjectId IN ${subjects}` : ''})
            GROUP BY Lesson.id, Lesson.description, Lesson.duration, Lesson.timeTo, Lesson.timeFrom, SubjectTranslation.translation, Lesson.duration,
                     BaseUser.grade, BaseUser.university, Lesson.priceInTimeUnitInDollars, BaseUser.id, BaseUser.firstName,
                     BaseUser.lastName
            ORDER BY FIELD(Lesson.urgency, '${urgencyTypes.Now}', '${urgencyTypes.Later}'), IF(FIELD(Lesson.urgency, '${urgencyTypes.Now}'), Lesson.createdOn, Lesson.timeFrom)
           ${limit ? `LIMIT ${limit}` : ''};
    `;
};
