module.exports = async function tutorWatch(id) {
    const lesson = await this.app.models.Lesson.findById(id);
    if (!lesson) {
        return {
            success: false,
            error: {
                message: 'errors.invalidLesson',
            },
        };
    }
    lesson.countWatch++;
    await lesson.save();
    return {
        success: true,
    };
};

