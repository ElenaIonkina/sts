const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

/**
 * Returns arrays tutor languages on languageId language for tutor
 * @param {number} tutorId - Tutor id
 * @param {number} languageId - Language id for translate
 * @returns {Promise<Array<Object>>} - Array of objects with translation and tutorId
 */
module.exports = async function getTutorLanguages(tutorId, languageId) {
    const user = tutorId ? (await this.app.models.BaseUser.findById(tutorId)) : {};
    if (user) {
        const query = `SELECT Language.id, Language.code${user.languageId ? ', LanguageTranslation.translation' : ''}
                        FROM Language ${user.languageId ? 'INNER JOIN LanguageTranslation ON Language.id = LanguageTranslation.languageId' : ''}
                        INNER JOIN TutorLanguage on Language.id = TutorLanguage.languageId
                        ${user.languageId ? `WHERE TutorLanguage.tutorId = ${user.id} and LanguageTranslation.translationLanguageId = ${user.languageId}` : ''}`;
        return (await runMySQLQuery(query)).map(l => {
            return {
                id: l.id,
                code: l.code,
                nameLanguage: l.translation,
            };
        });
    } else {
        return [];
    }
};
