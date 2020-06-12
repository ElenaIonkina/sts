const _ = require('lodash');
const UserInfoModel = require('../../defineModels/base-user/UserInfo');
const formatFromModel = require('../../../src/helpers/formaters/formatFromModel');
const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const LAST_DIGITS_COUNT = 4;

module.exports = async function (req, models) {
    const modelsToUse = models || this.app.models;
    const { userId } = req.accessToken;
    const user = await modelsToUse.BaseUser.findById(userId, { include: ['defaultCard', 'phone', 'cards'] });
    const { phone } = user.phone();
    const cards = user.cards().filter(c => !c.isDeleted);
    const defaultCard = cards.find(c => c.id === user.defaultCardId);
    const tutorSettings = await user.tutor.get();
    const res = formatFromModel({
        ...user.toJSON(),
        tutorLanguages: [],
        status: _.get(tutorSettings, 'status', TutorRequestStatus.NotSent),
    }, UserInfoModel);
    res.countCards = cards.length;
    res.lastPhoneDigits = phone.substring(phone.length - LAST_DIGITS_COUNT);
    if (defaultCard) {
        res.defaultCardInfo = {
            id: defaultCard.id,
            lastDigits: _.get(defaultCard, 'lastDigits'),
            isDefault: true,
        };
    }
    if (user.avatarId) {
        const avatar = await modelsToUse.Photo.findById(user.avatarId);
        res.profileImageUrl = {
            originalUrl: storagePaths.getPicturePath() +  avatar.originalUrl,
            previewUrl: storagePaths.getPicturePath() + avatar.previewUrl,
        };
    }
    if (tutorSettings) {
        const countFinishedLessonsQuery = `SELECT COUNT(Lesson.id) AS count
                            FROM tutoring.Lesson INNER JOIN tutoring.Tutor ON Lesson.tutorId = Tutor.id
                            WHERE Lesson.finished = 1 AND Tutor.baseUserId = ${user.id}`;
        const tutorRatingQuery = ` (SELECT (SUM(rate)/COUNT(id)) AS rating
                        FROM tutoring.LessonRating
                        WHERE lessonId IN (SELECT Lesson.id FROM tutoring.Lesson WHERE Lesson.finished = 1 AND Lesson.tutorId = ${tutorSettings.id}))`;
        const engLang = await modelsToUse.Language.findOne({ where: { code: 'eng' } });
        const [[{ countLesson }], subjects, languages, [{ rating }]] = await Promise.all([
            runMySQLQuery(countFinishedLessonsQuery),
            modelsToUse.TutorSubject.find({ where: { tutorId: tutorSettings.id } }),
            modelsToUse.Language.getTutorLanguages(tutorSettings.id, engLang.id),
            runMySQLQuery(tutorRatingQuery),
        ]);
        res.tutorLanguages = languages;
        res.countLesson = countLesson;

        res.rating = Math.floor(rating || 0);
        res.tutorSubjects = subjects.map(s => s.subjectId);
    }

    return res;
};
