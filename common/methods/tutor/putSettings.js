const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const validateTutorData = require('../../../src/helpers/validators/PutTutorSettingsValidator');

const SubjectNotFoundError = require('../../../src/helpers/errors/notFound/SubjectNotFound');
const LanguageNotFoundError = require('../../../src/helpers/errors/notFound/LanguageNotFound');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');

module.exports = async function putSettings(tutorId, subjects, languages, grade) {
    const validationError = validateTutorData({ grade });
    if (validationError) {
        throw validationError;
    }

    const tutor = await this.app.models.Tutor.findById(tutorId, { include: 'baseUser' });
    if (!tutor || tutor.baseUser().deletedAt) {
        throw new UserNotFoundError();
    }

    const [validSubjectsCount, validLanguagesCount] = await Promise.all([
        getValidSubjectsCount(subjects, this.app.models),
        getValidLanguagesCount(languages, this.app.models),
    ]);
    const isAllSubjectsValid = validSubjectsCount === subjects.length;
    if (!isAllSubjectsValid) {
        throw new SubjectNotFoundError();
    }
    const isAllLanguagesValid = validLanguagesCount === languages.length;
    if (!isAllLanguagesValid) {
        throw new LanguageNotFoundError();
    }

    await runMySQLTransactions(async (models) => {
        await models.BaseUser.updateAll({ id: tutor.baseUserId }, { grade });
        await destroyTutorSubjectsAndLanguages(tutorId, models);
        await addSubjectsAndLanguages(subjects, languages, tutorId, models);
    });

    return {
        result: {
            success: true,
        },
    };
};

async function destroyTutorSubjectsAndLanguages(tutorId, models) {
    const whereTutor = {
        tutorId,
    };
    await Promise.all([
        models.TutorSubject.destroyAll(whereTutor),
        models.TutorLanguage.destroyAll(whereTutor),
    ]);
}

async function addSubjectsAndLanguages(subjects, languages, tutorId, models) {
    await Promise.all([
        ...subjects.map(subjectId => models.TutorSubject.create({
            tutorId,
            subjectId,
        })),
        ...languages.map(languageId => models.TutorLanguage.create({
            tutorId,
            languageId,
        })),
    ]);
}

async function getValidSubjectsCount(subjects, models) {
    const validSubjects = await models.Subject.find({
        where: {
            id: {
                inq: subjects,
            },
        },
    });
    return validSubjects.length;
}

async function getValidLanguagesCount(languages, models) {
    const validSubjects = await models.Language.find({
        where: {
            id: {
                inq: languages,
            },
        },
    });
    return validSubjects.length;
}
