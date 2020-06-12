const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

/**
 * Returns arrays lessons languages on languageId language
 * @param {Array<number>} lessonsIds - Arrays lesson ids
 * @param {number} languageId - Language id for translate
 * @returns {Promise<Array<Object>>} - Array of objects with translation and lessonId
 */

module.exports = async function getLessonsLanguages(lessonsIds, languageId) {
    if (!lessonsIds.length) return [];
    const lessonIdsSQL = `(${lessonsIds.join(',')})`;
    return  await runMySQLQuery(`SELECT LanguageTranslation.translation, LessonLanguage.lessonId
                                       FROM tutoring.LanguageTranslation
                                        INNER JOIN tutoring.LessonLanguage ON LanguageTranslation.languageId = LessonLanguage.languageId
                                       WHERE LanguageTranslation.translationLanguageId = ${languageId} AND LessonLanguage.lessonId IN ${lessonIdsSQL}`);
};
