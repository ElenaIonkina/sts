module.exports = async function (app) {
    if (!app.get('needToMigrateCountMsg')) return;
    // !!! countMsg and countProposals deprecated. countProposals is calculated field
    // const lessons = await app.models.Lesson.find();
    // const promises = lessons.map(async l => {
    //     l.countProposals = l.countMsg || 0;
    //     return l.save();
    // });
    // await Promise.all(promises);
};
