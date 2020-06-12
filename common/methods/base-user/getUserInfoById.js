const _ = require('lodash');
const UserNotFoundError = require('../../../src/helpers/errors/notFound/UserNotFound');
const USER_ROLES = require('../../../src/helpers/const/userRoles');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
module.exports = async function getUserInfoById(userId) {
    const user = await this.app.models.BaseUser.findById(userId, {
        include: [{
            relation: 'tutor',
            scope: {
                include: ['subjects', 'tutorLanguages', 'photoOfficialId', 'photoOfficialTranscript'],
            },
        }, {
            relation: 'phone',
        }],
    });
    if (!user || user.role === USER_ROLES.ADMIN) {
        throw new UserNotFoundError();
    }
    const userJson = user.toJSON();
    const userDto = {
        firstName: userJson.firstName,
        lastName: userJson.lastName,
        email: userJson.email,
        phone: _.get(userJson, 'phone.phone', ''),
        country: userJson.country,
        city: userJson.city,
        university: userJson.university,
        grade: userJson.grade,
        status: userJson.userStatus,
    };
    if (userJson.tutor) {
        userDto.tutor = await getTutorProps(userJson, this.app);
    }
    return {
        result: userDto,
    };
};

async function getTutorProps(userJson, app) {
    const tutor = {
        status: userJson.tutor.status,
        id: userJson.tutor.id,
    };
    const engLang = await app.models.Language.findOne({ where: { code: 'eng' } });
    const [subjects, languages] = await Promise.all([
        app.models.SubjectTranslation.find({
            where: {
                languageId: engLang.id,
            },
            order: ['translation ASC'],
        }),
        app.models.LanguageTranslation.find({
            where: {
                translationLanguageId: engLang.id,
            },
            order: ['translation ASC'],
        }),
    ]);
    const tutorLanguages = _.get(userJson, 'tutor.tutorLanguages', []);
    const tutorSubjects = _.get(userJson, 'tutor.subjects', []);
    tutor.languages = languages.map(l => {
        return {
            id: l.languageId,
            language: l.translation,
            selected: Boolean(tutorLanguages.find(tutorL => tutorL.id === l.languageId)),
        };
    });
    tutor.subjects = subjects.map(s => {
        return {
            id: s.subjectId,
            subject: s.translation,
            selected: Boolean(tutorSubjects.find(tutorS => tutorS.id === s.subjectId)),
        };
    });
    if (userJson.tutor.photoOfficialId) {
        tutor.photoOfficialId = {
            originalUrl: storagePaths.getPicturePath() + userJson.tutor.photoOfficialId.originalUrl,
            previewUrl: storagePaths.getPicturePath()  + userJson.tutor.photoOfficialId.previewUrl,
        };
    }
    if (userJson.tutor.photoOfficialTranscript) {
        tutor.photoOfficialTranscript = {
            originalUrl: storagePaths.getPicturePath() + userJson.tutor.photoOfficialTranscript.originalUrl,
            previewUrl: storagePaths.getPicturePath() + userJson.tutor.photoOfficialTranscript.previewUrl,
        };
    }
    return tutor;
}
