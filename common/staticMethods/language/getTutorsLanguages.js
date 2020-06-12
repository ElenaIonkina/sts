const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

/**
 * Returns arrays tutor languages on languageId language
 * @param {Array<number>} tutorIds - Arrays lesson ids
 * @param {number} languageId - Language id for translate
 * @returns {Promise<Array<Object>>} - Array of objects with translation and tutorId
 */

module.exports = async function getTutorLanguages(tutorIds, languageId) {
    if (!tutorIds.length) return [];
    const tutorIdsSQL = `(${tutorIds.join(',')})`;
    return  await runMySQLQuery(`SELECT LanguageTranslation.translation, TutorLanguage.tutorId
                                       FROM tutoring.LanguageTranslation
                                        INNER JOIN tutoring.TutorLanguage ON LanguageTranslation.languageId = TutorLanguage.languageId
                                       WHERE LanguageTranslation.translationLanguageId = ${languageId} AND TutorLanguage.tutorId IN ${tutorIdsSQL}`);
};
