const _ = require('lodash');
const CreateLessonValidator = require('../../../src/helpers/validators/CreateLessonValidator');
const saveImage = require('../../../src/helpers/files/saveImage');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const scheduleCheckRequestExpired = require('../../../src/tasksScheduler/schedulers/checkRequestExpiredScheduler');

const LanguageNotFoundError = require('../../../src/helpers/errors/notFound/LanguageNotFound');
const SubjectNotFoundError = require('../../../src/helpers/errors/notFound/SubjectNotFound');
const FriendNotFoundError = require('../../../src/helpers/errors/notFound/FriendNotFound');
const CardNotFoundError = require('../../../src/helpers/errors/notFound/CardNotFound');
const { REQUEST } = require('../../../src/helpers/const/lessonTypes');
const LessonPriceInDollars = require('../../../src/helpers/const/LessonPriceInDollars');
const Grade = require('../../../src/helpers/const/Grade');
module.exports = async function createRequest(req, subjectId, languages, description, paymentType,
                                              discount, urgency, timeFrom, timeTo, duration, listOfFriends) {
    const lowerUrgency = urgency.toLowerCase();
    const uniqueFriends = listOfFriends ? [...(new Set(listOfFriends))] : null;
    const { userId } = req.accessToken;

    const validationErr = await validateAndGetError({
        urgency: lowerUrgency,
        description,
        timeTo,
        timeFrom,
        languages,
        subjectId,
        listOfFriends: uniqueFriends,
    }, this.app.models, userId);
    if (validationErr) {
        throw validationErr;
    }
    const res = {
        result: {
            success: false,
        },
    };
    await runMySQLTransactions(async (models) => {
        const [languageModels, lessonUser, lessonRequest] = await Promise.all([
            models.Language.find({
                where: {
                    code: {
                        inq: languages,
                    },
                },
            }),
            models.BaseUser.findOne({
                where: {
                    id: userId,
                    deletedAt: null,
                },
            }),
            models.Lesson.create({
                description,
                urgency: lowerUrgency,
                timeFrom,
                timeTo,
                duration,
                subjectId,
                type: REQUEST,
                baseUserId: userId,
                isPublic: !uniqueFriends,
            }),
        ]);

        await Promise.all(languageModels.map(language => lessonRequest.lessonLanguages.add(language)));

        await saveFriends(models, lessonRequest, uniqueFriends);
        await savePhotosAsync(req, lessonRequest, models);

        const userGrade = lessonUser.grade;
        lessonRequest.priceInTimeUnitInDollars = userGrade.toString() === Grade.eighthSchool
            ? LessonPriceInDollars[Grade.eighthSchool]
            : LessonPriceInDollars[userGrade.toString() === Grade.sixthCollege
                ? Grade.sixthCollege : (userGrade.toString() === Grade.twelfthSchool
                    ? Grade.firstCollege : (userGrade.toString() === Grade.sixthCollege
                        ? Grade.sixthCollege : (userGrade + 1)))];
        await lessonRequest.save();
        await scheduleCheckRequestExpired(models, lessonRequest);
        res.result = {
            success: true,
            id: lessonRequest.id,
        };
    });

    return res;
};

async function validateAndGetError(validationData, models, userId) {
    const validationErr = CreateLessonValidator(validationData);
    if (validationErr) {
        return validationErr;
    }

    const isLanguagesNotValid = await models.Language.validateLanguagesByCodes(validationData.languages);
    if (isLanguagesNotValid) {
        return new LanguageNotFoundError();
    }

    const isSubjectNotValid = await models.Subject.validateSubjectsById(validationData.subjectId);
    if (isSubjectNotValid) {
        return new SubjectNotFoundError();
    }

/*    const { cardId } = validationData;
    const userCard = await models.UserCard.findOne({
        where: {
            id: cardId,
            baseUserId: userId,
            isDeleted: false,
        },
    });
    if (!userCard) return new CardNotFoundError();
    */

    if (!validationData.listOfFriends) return;

    const validFriends = await models.Friend.find({
        where: {
            userId,
            friendId: {
                inq: validationData.listOfFriends,
            },
        },
    });
    if (validFriends.length !== validationData.listOfFriends.length) {
        return new FriendNotFoundError();
    }
}

async function saveFriends(models, request, listOfFriends) {
    if (!listOfFriends) return;
    return Promise.all(listOfFriends.map(f => models.FriendsLessons.create({
        lessonId: request.id,
        friendUserId: f,
    })));
}

function savePhotosAsync(httpReq, request, models) {
    const photos = _.get(httpReq, 'files.photo', []);
    const photosPath = storagePaths.getLessonUploadDirectory(request.id);

    return Promise.all(photos.map(async photo => {
        const sources = await saveImage(photo, photosPath, { withPreview: true });
        const lessonPhoto = await models.LessonPhoto.create({
            originalPath: sources.original.getPath(),
            originalUrl: sources.original.getUrl(),
            previewPath: sources.preview.getPath(),
            previewUrl: sources.preview.getUrl(),
        });
        await lessonPhoto.lesson(request);
        await lessonPhoto.save();
        return lessonPhoto;
    }));
}
