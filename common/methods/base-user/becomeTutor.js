const _ = require('lodash');
const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const BecomeTutorValidator = require('../../../src/helpers/validators/BecomeTutorValidator');
const saveImage = require('../../../src/helpers/files/saveImage');
const storagePaths = require('../../../src/datasource/storage/storagePaths');

const LanguageNotFoundError = require('../../../src/helpers/errors/notFound/LanguageNotFound');
const SubjectNotFoundError = require('../../../src/helpers/errors/notFound/SubjectNotFound');

const USER_GRADE_COEFFICIENT = 100;

module.exports = async function becomeTutor(req, email, lastName, subjects, languages) {
    const user = await this.findById(_.get(req, 'accessToken.userId'));
    if (await isTutorExist.call(this, user)) {
        return true;
    }

    if (!Array.isArray(languages)) languages = [languages];
    const isLanguagesNotValid = await this.app.models.Language.validateLanguagesByCodes(languages);
    if (isLanguagesNotValid) {
        throw new LanguageNotFoundError();
    }
    if (!Array.isArray(subjects)) subjects = [subjects];
    const isSubjectsNotValid = await this.app.models.Subject.validateSubjectsById(subjects);
    if (isSubjectsNotValid) {
        throw new SubjectNotFoundError();
    }
    const subjectModels = await this.app.models.Subject.find({ where: { id: { inq: subjects } } });
    const higherUserGradeSubjects = subjectModels
        .filter(s => Math.floor(s.level / USER_GRADE_COEFFICIENT) > Math.floor(user.grade / USER_GRADE_COEFFICIENT));
    if (higherUserGradeSubjects.length) {
        throw new SubjectNotFoundError();
    }
    const validationsErrors = await new BecomeTutorValidator()
        .validateAsync({
            email,
            lastName,
            languages,
            photoOfficialId: _.get(req, 'files.photoOfficialId.0'),
            photoOfficialTranscript: _.get(req, 'files.photoOfficialTranscript.0'),
        });
    if (validationsErrors.hasErrors()) {
        throw validationsErrors;
    }

    user.email = email;
    user.lastName = lastName;
    try {
        const languageModels = await this.app.models.Language.find({
            where: {
                code: {
                    inq: languages,
                },
            },
        });
        const tutoringSettings = await this.app.models.Tutor.create({
            status: TutorRequestStatus.Pending,
        });
        await tutoringSettings.baseUser(user);
        await tutoringSettings.save();

        await Promise.all(subjectModels.map(subject => tutoringSettings.subjects.add(subject)));
        await Promise.all(languageModels.map(language => tutoringSettings.tutorLanguages.add(language)));

        await tutoringSettings.photoOfficialId(
            await saveDocument.call(this, req, 'photoOfficialId', tutoringSettings.id),
        );
        await tutoringSettings.photoOfficialTranscript(
            await saveDocument.call(this, req, 'photoOfficialTranscript', tutoringSettings.id),
        );
        await tutoringSettings.save();
        await user.save({
            preserveAccessTokens: true,
        });
    } catch (e) {
        await this.app.models.Tutor.destroyAll({
            baseUserId: user.id,
        });
        throw Error;
    }
    return true;
};

async function isTutorExist(user) {
    return Boolean(await this.app.models.Tutor.findOne({
        where: {
            baseUserId: user.id,
        },
    }));
}

async function saveDocument(req, name, tutorId) {
    const photosPath = storagePaths.getTutorUploadDirectory(tutorId);
    const file = _.get(req, `files.${name}.0`);

    const sources = await saveImage(file, photosPath, { withPreview: true });
    return await this.app.models.Photo.create({
        originalPath: sources.original.getPath(),
        originalUrl: sources.original.getUrl(),
        previewPath: _.result(sources, 'preview.getPath'),
        previewUrl: _.result(sources, 'preview.getUrl'),
    });
}
