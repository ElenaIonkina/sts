const InvalidPhoneError = require('../../../src/helpers/errors/validation/InvalidPhoneError');
const WrongSmsCodeError = require('../../../src/helpers/errors/WrongSmsCode');

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

module.exports = async function verifyCode(req, phone, smsCode) {
    await runMySQLTransactions(async (models) => {
        const noSpacePhone = phone.replace(/ /g, '');
        const phoneModel = await models.Phone.findOne({
            where: {
                phone: noSpacePhone,
                baseUserId: null,
                used: true,
            },
        });
        if (!phoneModel) {
            throw new InvalidPhoneError();
        } else if (String(phoneModel.smsCode) !== smsCode) {
            throw new WrongSmsCodeError();
        }
        const { userId } = req.accessToken;
        await models.Phone.destroyAll({ baseUserId: userId });
        phoneModel.baseUserId = userId;

        await phoneModel.save();
    });
    return {
        result: {
            success: true,
        },
    };
};
