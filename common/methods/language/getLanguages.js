const _ = require('lodash');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function getLanguages(req) {
    const userId = _.get(req, 'accessToken.userId');
    const user = userId ? (await this.app.models.BaseUser.findById(userId)) : {};
    const query = `SELECT Language.code${user.languageId ? ', LanguageTranslation.translation' : ''}
                    FROM Language ${user.languageId ? 'INNER JOIN LanguageTranslation ON Language.id =  LanguageTranslation.languageId' : ''}
                    ${user.languageId ? `WHERE LanguageTranslation.translationLanguageId = ${user.languageId}` : ''}`;
    return (await runMySQLQuery(query)).map(l => {
        return {
            code: l.code,
            nameLanguage: l.translation,
        };
    });
};
