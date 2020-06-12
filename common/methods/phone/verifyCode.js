const USER_STATUSES = require('../../../src/helpers/const/UserStatus');

const InvalidPhoneError = require('../../../src/helpers/errors/validation/InvalidPhoneError');
const WrongSmsCodeError = require('../../../src/helpers/errors/WrongSmsCode');
const UserBlockedError = require('../../../src/helpers/errors/UserBlockedError');
const LanguageNotFoundError = require('../../../src/helpers/errors/notFound/LanguageNotFound');

const HALF_YEAR = 60 * 60 * 24 * 30 * 6;

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function verifyCode(languageCode, phone, smsCode, deviceToken) {
    const res = {
        result: {},
    };
    await runMySQLTransactions(async (models) => {
        const noSpacePhone = phone.replace(/ /g, '');
        const phoneModel = await models.Phone.findOne({
            where: {
                phone: noSpacePhone,
            },
            include: 'baseUser',
        });
        if (!phoneModel) {
            throw new InvalidPhoneError();
        } else if (String(phoneModel.smsCode) !== smsCode || phoneModel.used) {
            throw new WrongSmsCodeError();
        }

        const language = await this.app.models.Language.getLanguageByCode(languageCode);
        if (!language || !language.id) {
            throw new LanguageNotFoundError();
        }
        const baseUser = await phoneModel.baseUser();
        if (baseUser && baseUser.userStatus === USER_STATUSES.Blocked) {
            throw new UserBlockedError();
        }
        if (baseUser) {
            baseUser.languageId = language.id;
            const [token] = await Promise.all([
                baseUser.createAccessToken(HALF_YEAR),
                baseUser.save(),
            ]);
            res.result.isCreated = true;
            res.result.token = token.id;
            const userDebts = await runMySQLQuery(`
                                SELECT Debt.amount
                                FROM tutoring.Debt
                                    INNER JOIN Lesson L on Debt.lessonId = L.id
                                WHERE L.baseUserId = ${baseUser.id}`);
            res.result.debtSum = userDebts.length ? userDebts[0].amount : 0;
            await models.DeviceToken.findOrCreate({
                where: {
                    device: deviceToken,
                    accessTokenId: token.id,
                },
            }, {
                device: deviceToken,
                accessTokenId: token.id,
            });
        } else {
            res.result.isCreated = false;
            res.result.debtSum = 0;
        }
        phoneModel.used = true;
        await phoneModel.save();
    });
    return res;
};
