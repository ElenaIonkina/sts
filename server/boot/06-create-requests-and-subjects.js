module.exports = async function (app) {
    if (!process.env.IS_DEV) return;
    const [subject, created] = await app.models.Subject.findOrCreate(
        {
            where: {
                name: 'JS',
            },
        },
        {
            name: 'JS',
        },
    );
    if (!created) return;
    await app.models.Lesson.findOrCreate(
        {
            where: {
                type: 'request',
            },
        },
        {
            description: 'Hello there! It is description',
            urgency: 'now',
            type: 'request',
            timeTo: 12354213,
            timeFrom: 12354299,
            duration: 4,
            isPublic: true,
            subjectId: subject.id,
        },
    );
};
