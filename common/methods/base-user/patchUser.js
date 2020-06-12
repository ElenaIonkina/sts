const _ = require('lodash');
const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const PatchUserValidator = require('../../../src/helpers/validators/PatchUserValidator');
const saveImage = require('../../../src/helpers/files/saveImage');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const removeDirectory = require('../../../src/helpers/promise/removeFilePromise');
const EmailExistsError = require('../../../src/helpers/errors/exists/EmailExists');
const COUNTRY_CODES = require('../../../src/helpers/const/CountryCodes');
const CountryNotFoundError = require('../../../src/helpers/errors/notFound/CountryNotFound');

module.exports = async function patchUser(req, firstName, lastName, country, university, grade, email, city) {
    const stringGrade = grade ? String(grade) : null;
    const [picture] = _.get(req, 'files.picture', []);
    const validatorObject = {
        firstName,
        lastName,
        country,
        university,
        grade: stringGrade,
        email,
    };
    if (picture) {
        validatorObject.size = picture.size;
        validatorObject.mimetype = picture.mimetype;
    }
    const validationErr = PatchUserValidator(validatorObject);
    if (validationErr) {
        throw validationErr;
    }
    const { userId } = req.accessToken;
    await runMySQLTransactions(async (models) => {
        const user = await models.BaseUser.findById(userId, { include: 'avatar' });
        const oldAvatar = user.avatar();
        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }
        if (country) {
            user.country = country;
            const countryCode = COUNTRY_CODES.find(c => c.name === country);
            if (!countryCode) {
                throw new CountryNotFoundError();
            }
            user.countryCode = countryCode['alpha-3'];
        }
        if (city) {
            user.city = city;
        }
        if (university) {
            user.university = university;
        }
        if (email) {
            const userEmail = await models.BaseUser.findOne({ where: { email, deletedAt: null } });
            if (userEmail) {
                throw new EmailExistsError();
            }
            user.email = email;
            user.defaultCardId = null;
            await models.UserCard.updateAll({ baseUserId: userId }, { isDeleted: true });
        }
        if (stringGrade) {
            user.grade = stringGrade;
        }
        if (picture) {
            const photoPath = storagePaths.getUserPhotoUploadDirectory(userId);
            const sources = await saveImage(picture, photoPath, { withPreview: true });
            const photo = await models.Photo.create({
                originalPath: sources.original.getPath(),
                originalUrl: sources.original.getUrl(),
                previewPath: sources.preview.getPath(),
                previewUrl: sources.preview.getUrl(),
            });
            user.avatarId = photo.id;
        }
        await user.save();
        if (oldAvatar && picture) {
            await Promise.all([
                removeDirectory(getFolderByFile(oldAvatar.originalPath), { isDirectory: true }),
                removeDirectory(getFolderByFile(oldAvatar.previewPath), { isDirectory: true }),
                models.Photo.destroyAll({ id: user.avatarId }),
            ]);
        }
    });

    return {
        result: {
            success: true,
        },
    };
};

function getFolderByFile(filePath) {
    return filePath.substring(0, filePath.lastIndexOf('/'));
}
