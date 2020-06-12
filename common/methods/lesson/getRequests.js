const convertToOneOrInt = require('../../../src/helpers/convertToOneOrInt');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const { REQUEST, EXPIRED, STARTED } = require('../../../src/helpers/const/LessonStatuses');
const { Blocked } = require('../../../src/helpers/const/UserStatus');
const countQuery = `SELECT count(Lesson.id) AS count 
                    FROM tutoring.Lesson 
                        INNER JOIN tutoring.BaseUser ON Lesson.baseUserId = BaseUser.id 
                    WHERE Lesson.finished = 0 AND BaseUser.deletedAt IS NULL 
                        AND BaseUser.userStatus != '${Blocked}' AND Lesson.subjectId IS NOT NULL`;

module.exports = async function getRequests(page, perPage) {
    const engLang = await this.app.models.Language.findOne({ where: { code: 'eng' } });
    const intPage = convertToOneOrInt(page);
    const intPerPage = convertToOneOrInt(perPage);
    const skip = (intPage - 1) * intPerPage;
    const requestQuery = `SELECT Lesson.id, BaseUser.firstName, BaseUser.lastName, Lesson.timeFrom, Lesson.baseUserId,
                            SubjectTranslation.translation, Lesson.createdOn, Lesson.tutorId, Lesson.expiredAt
                          FROM tutoring.Lesson
                            INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                            INNER JOIN tutoring.BaseUser ON Lesson.baseUserId = BaseUser.id
                          WHERE Lesson.finished = 0 AND SubjectTranslation.languageId = ${engLang.id} 
                            AND BaseUser.deletedAt IS NULL AND BaseUser.userStatus != '${Blocked}' AND Lesson.subjectId IS NOT NULL
                          ORDER BY Lesson.id ASC
                          LIMIT ${intPerPage}
                          OFFSET ${skip}`;
    const [requests, [{ count }]] = await Promise.all([
        runMySQLQuery(requestQuery),
        runMySQLQuery(countQuery),

    ]);
    if (!requests.length) {
        return {
            result: {
                requests: [],
                perPage: intPerPage,
                page: 1,
            },
            totalPage: 0,
        };
    }
    const lessonsIdsString = `(${requests.map(r => r.id).join(',')})`;
    const languages = await runMySQLQuery(`SELECT LessonLanguage.lessonId, LanguageTranslation.translation
                                                 FROM tutoring.LessonLanguage
                                                    INNER JOIN tutoring.LanguageTranslation ON LessonLanguage.languageId = LanguageTranslation.languageId
                                                 WHERE LanguageTranslation.translationLanguageId = ${engLang.id} AND LessonLanguage.lessonId IN ${lessonsIdsString}`);

    return {
        result: {
            requests: toDto(requests, languages),
            perPage: intPerPage,
            page: intPage,
            totalPages: Math.ceil(count / intPerPage),
        },
    };
};

function toDto(requests, languages) {
    return requests.map(r => {
        return {
            id: r.id,
            studentId: r.baseUserId,
            student: `${r.firstName} ${r.lastName}`,
            subject: r.translation,
            languages: languages.filter(l => l.lessonId === r.id).map(l => l.translation).join(', '),
            requestTime: r.createdOn,
            status: getStatus(r),
        };
    });
}

function getStatus(request) {
    if (request.tutorId) {
        return STARTED;
    }
    if (request.expiredAt) {
        return EXPIRED;
    }
    return REQUEST;
}
