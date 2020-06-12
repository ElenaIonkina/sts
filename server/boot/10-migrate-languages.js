const LANGUAGES = require('../../src/helpers/const/Languages');

module.exports = async function migrateLanguages(app) {
    if (!app.get('needToMigrateLanguages')) return;
    const [lessons, tutors] = await Promise.all([app.models.Lesson.find(), app.models.Tutor.find()]);
    await Promise.all([...migrateItemsLanguages(lessons), ...migrateItemsLanguages(tutors)]);
};

function migrateItemsLanguages(items) {
    return items.map(item => {
        item.languages = item.languages
            .filter(findConstLangByLanguage)
            .map(l => findConstLangByLanguage(l).code);
        item.languages = [...(new Set(item.languages))];
        return item.save();
    });
}

function findConstLangByLanguage(language) {
    return LANGUAGES.find(lang => lang.language === language || lang.code === language);
}
