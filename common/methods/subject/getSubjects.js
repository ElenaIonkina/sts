const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function getLanguages(req) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId);
    const query = `SELECT Subject.id, SubjectTranslation.translation, Subject.level 
                    FROM tutoring.Subject INNER JOIN SubjectTranslation ON Subject.id =  SubjectTranslation.subjectId
                    WHERE SubjectTranslation.languageId = ${user.languageId}`;
    const subjects = await runMySQLQuery(query);
    const schools = subjects.filter(s => s.level  < 100).map(s => ({ idSubject: s.id, nameSubject: s.translation }));
    const universities = subjects.filter(s => s.level  > 99).map(s => ({ idSubject: s.id, nameSubject: s.translation }));

    return {
        schools,
        universities,
    };
};
