const LANGUAGES = require('../../src/helpers/const/Languages');

module.exports = async function addLangsAndMigrate(app) {
    const languages = (await Promise.all(LANGUAGES.map(l => app.models.Language.findOrCreate(
        {
            where: {
                code: l.code,
            },
        },
        {
            code: l.code,
        },
    )))).map(l => l[0]);
    const engId = languages.find(l => l.code === 'eng').id;
    const users = await app.models.BaseUser.find();
    await Promise.all(users.map(u => {
        if (u.languageId) return null;
        u.languageId = engId;
        return u.save();
    }));
    await Promise.all(languages.map(lang => {
        const translations = LANGUAGES.find(l => l.code === lang.code).translations;
        return Promise.all(Object.keys(translations).map(async (translationCode) => {
            const translationLang = languages.find(l => l.code === translationCode);
            if (!translationLang) return;
            const language = await app.models.LanguageTranslation.findOne({
                where: {
                    languageId: lang.id,
                    translationLanguageId: translationLang.id,
                },
            });
            if (!language) {
                return await app.models.LanguageTranslation.create({
                    translation: translations[translationCode],
                    languageId: lang.id,
                    translationLanguageId: translationLang.id,
                });
            }
            if (language.translation !== translations[translationCode]) {
                language.translation = translations[translationCode];
                return await language.save();
            }
        }));
    }));
    if (!app.get('needToMigrateLanguagesWithTranslations')) return;
    const [lessons, tutors] = await Promise.all([app.models.Lesson.find(), app.models.Tutor.find()]);
    await Promise.all([...migrateLessonLanguages(lessons, app, languages), ...migrateTutorLanguages(tutors, app, languages)]);
};

function migrateLessonLanguages(lessons, app, langs) {
    return lessons.map(lesson =>
        Promise.all(lesson.languages.map(l => {
            const language = langs.find(lang => lang.code === l);
            if (!language) return null;
            return app.models.LessonLanguage.findOrCreate({
                where: {
                    lessonId: lesson.id,
                    languageId: language.id,
                },
            }, {
                lessonId: lesson.id,
                languageId: language.id,
            });
        })));
}

function migrateTutorLanguages(tutors, app, langs) {
    return tutors.map(tutor =>
        Promise.all(tutor.languages.map(l => {
            const language = langs.find(lang => lang.code === l);
            if (!language) return null;
            return app.models.TutorLanguage.findOrCreate({
                where: {
                    tutorId: tutor.id,
                    languageId: language.id,
                },
            }, {
                tutorId: tutor.id,
                languageId: language.id,
            });
        })));
}
