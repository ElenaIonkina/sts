const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function validateSubjectsById(ids) {
    if (!Array.isArray(ids)) ids = [ids];
    const [count] = await runMySQLQuery(`SELECT COUNT(id) AS count FROM Subject 
                                                        WHERE Subject.id IN ${`(${ids.join(',')})`}`);
    return ids.length !== count.count;
};
