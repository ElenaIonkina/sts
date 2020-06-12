const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

/**
 * Returns arrays tutor subjects on languageId language
 * @param {Array<number>} tutorIds - Arrays lesson ids
 * @param {number} languageId - Language id for translate
 * @returns {Promise<Array<Object>>} - Array of objects with translation and tutorId
 */

module.exports = async function getTutorsSubjects(tutorIds, languageId) {
    if (!tutorIds.length) return [];
    const tutorIdsSQL = `(${tutorIds.join(',')})`;
    return  await runMySQLQuery(`SELECT SubjectTranslation.translation, TutorSubject.tutorId
                                       FROM tutoring.SubjectTranslation
                                        INNER JOIN tutoring.TutorSubject ON SubjectTranslation.subjectId = TutorSubject.subjectId
                                       WHERE SubjectTranslation.languageId = ${languageId} AND TutorSubject.tutorId IN ${tutorIdsSQL}`);
};
