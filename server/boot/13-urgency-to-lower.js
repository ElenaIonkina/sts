module.exports = async function migrateUrgencyToLower(app) {
    const lessons = await app.models.Lesson.find();
    await Promise.all(lessons.map(l => {
        l.urgency = l.urgency.toLowerCase();
        return l.save();
    }));
};
