const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function validateLanguagesByCodes(languages) {
    if (typeof languages === 'string') languages = [languages];
    const [count] = await runMySQLQuery(`SELECT COUNT(id) AS count FROM Language 
                                                        WHERE Language.code IN ${`("${languages.join('","')}")`}`);
    return languages.length !== count.count;
};
