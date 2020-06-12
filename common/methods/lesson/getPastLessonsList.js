const convertToOneOrInt = require('../../../src/helpers/convertToOneOrInt');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const COUNT_QUERY = 'SELECT COUNT(Lesson.id) AS count FROM tutoring.Lesson WHERE Lesson.finished AND Lesson.tutorId IS NOT NULL';

module.exports = async function getPastLessonsList(page, perPage) {
    const intPage = convertToOneOrInt(page);
    const intPerPage = convertToOneOrInt(perPage);
    const [pastLessons, [countQueryResult]] = await Promise.all([
        getPastLessons(this.app.models, intPage, intPerPage),
        runMySQLQuery(COUNT_QUERY),
    ]);
    const { count } = countQueryResult;
    const pastLessonsDto = toDto(pastLessons);
    return {
        result: {
            pastLessons: pastLessonsDto,
            totalPages: Math.ceil(count / intPerPage),
            page: intPage,
            perPage: intPerPage,
        },
    };
};

function toDto(lessons) {
    return lessons.map(l => {
        const subject = l.translation;
        const languages = l.languages.join(', ');
        return {
            id: l.id,
            studentFullName: `${l.studentFirstName} ${l.studentLastName}`,
            studentId: l.studentId,
            tutorFullName: `${l.tutorFirstName} ${l.tutorLastName}`,
            tutorId: l.tutorId,
            startTime: l.startTime,
            duration: l.duration,
            recordingUrl: l.recordingUrl,
            subject,
            languages,
        };
    });
}

async function getPastLessons(models, page, perPage) {
    const { id: engLangId } = await models.Language.getLanguageByCode('eng');
    const skip = (page - 1) * perPage;
    const pastLessonsQuery = `SELECT Lesson.id, student.firstName AS studentFirstName, student.lastName AS studentLastName, student.id AS studentId,
                                tutor.firstName AS tutorFirstName, tutor.lastName AS tutorLastName, tutor.id AS tutorId, SubjectTranslation.translation, 
                                Lesson.startTime, Lesson.duration, Lesson.recordingUrl
                              FROM tutoring.Lesson
                                INNER JOIN tutoring.BaseUser AS student ON Lesson.baseUserId = student.id
                                INNER JOIN tutoring.Tutor ON Lesson.tutorId = Tutor.id
                                INNER JOIN tutoring.BaseUser AS tutor ON Tutor.baseUserId = tutor.id
                                INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                              WHERE Lesson.finished = 1 AND SubjectTranslation.languageId = ${engLangId}
                              ORDER BY Lesson.id
                              LIMIT ${perPage}
                              OFFSET ${skip}`;
    const lessons = await runMySQLQuery(pastLessonsQuery);
    const lessonsIds = lessons.map(l => l.id);
    const lessonLanguages = await models.Language.getLessonsLanguages(lessonsIds, engLangId);
    return lessons.map(l => {
        const languages = lessonLanguages.filter(ll => ll.lessonId === l.id).map(l => l.translation);
        return {
            ...l,
            languages,
        };
    });
}
