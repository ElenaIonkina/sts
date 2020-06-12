const signUpValidator = require('../../../src/helpers/validators/SignUpValidator');

const InvalidPhoneError = require('../../../src/helpers/errors/validation/InvalidPhoneError');
const EmailExistsError = require('../../../src/helpers/errors/exists/EmailExists');
const UserExistsError = require('../../../src/helpers/errors/exists/UserExists');
const LanguageNotFoundError = require('../../../src/helpers/errors/notFound/LanguageNotFound');
const CountryNotFoundError = require('../../../src/helpers/errors/notFound/CountryNotFound');

const USER_STATUS = require('../../../src/helpers/const/UserStatus');
const COUNTRY_CODES = require('../../../src/helpers/const/CountryCodes');
const HALF_YEAR = 60 * 60 * 24 * 30 * 6;

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function signUp(deviceToken, firstName, lastName, email, country, city, university, grade, promoCode, phoneNumber, languageCode) {
    const validationErr = signUpValidator({
        deviceToken,
        firstName,
        lastName,
        email,
        country,
        city,
        university,
        grade,
        promoCode,
    });
    if (validationErr) {
        throw validationErr;
    }
    const noSpacePhone = phoneNumber.replace(/ /g, '');
    const res = {
        result: {},
    };
    const language = await this.app.models.Language.getLanguageByCode(languageCode);
    if (!language || !language.id) {
        throw new LanguageNotFoundError();
    }
    await runMySQLTransactions(async (models) => {
        const phone = await models.Phone.findOne({ where: { phone: noSpacePhone, used: true } });
        if (!phone) {
            throw new InvalidPhoneError();
        }
        if (phone.baseUserId) {
            throw new UserExistsError();
        }
        if (email) {
            const userEmail = await models.BaseUser.findOne({ where: { email, deletedAt: null } });
            if (userEmail) {
                throw new EmailExistsError();
            }
        }

        const countryCode = COUNTRY_CODES.find(c => c.name === country);
        if (!countryCode) {
            throw new CountryNotFoundError();
        }

        const userData = {
            userStatus: USER_STATUS.Active,
            firstName: firstName.replace(/\s+/g, ' ').trim(),
            email,
            country,
            city,
            university,
            grade,
            countryCode: countryCode['alpha-3'],
            languageId: language.id,
        };
        if (lastName) {
            userData.lastName = lastName.replace(/\s+/g, ' ').trim();
        }
        const newUser = await models.BaseUser.create(userData);
        await phone.baseUser(newUser);
        const [token] = await Promise.all([newUser.createAccessToken(HALF_YEAR), phone.save()]);
        await Promise.all([
            models.DeviceToken.create({
                device: deviceToken,
                accessTokenId: token.id,
            }),
            models.Settings.create({
                baseUserId: newUser.id,
            }),
        ]);
        res.result.token = token.id;
    });

    return res;
};
