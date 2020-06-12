const SUBJECTS = require('../../src/helpers/const/Subjects');

module.exports = async function addLangsAndMigrate(app) {
    const existingSubjects = await app.models.Subject.find();
    for (const s of SUBJECTS) {
        const subject = await existingSubjects.find(existS => existS.name === s.name);
        const baseSubjectId = s.base ? (await app.models.Subject.findOne({ where: { name: s.base } })).id : null;
        if (subject) {
            subject.name = s.name;
            subject.level = s.level;
            subject.baseSubjectId = baseSubjectId;
            await subject.save();
            continue;
        }
        await app.models.Subject.create({
            name: s.name,
            level: s.level,
            baseSubjectId,
        });
    }
    const newSubjects = await app.models.Subject.find();
    await Promise.all(newSubjects.map(async s => {
        const subject = SUBJECTS.find(sub => sub.name === s.name);
        if (!subject) {
            await app.models.SubjectTranslation.destroyAll({
                subjectId: s.id,
            });
            return s.destroy();
        }
        return Promise.all(Object.keys(subject.translations).map(async (code) => {
            const language = await app.models.Language.findOne({ where: { code } });
            if (!language) return null;
            await app.models.SubjectTranslation.findOrCreate({
                where: {
                    subjectId: s.id,
                    languageId: language.id,
                },
            }, {
                subjectId: s.id,
                languageId: language.id,
                translation: subject.translations[code],
            });
        }));
    }));
};
