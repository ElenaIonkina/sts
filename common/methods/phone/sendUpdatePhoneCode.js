const twilioApi = require('../../../src/api/twilioApi');
const getTestFeatures = require('../../../src/helpers/getTestFeatures');
const UserPhoneNotFound = require('../../../src/helpers/errors/notFound/UserPhoneNotFound');
const PhoneExists = require('../../../src/helpers/errors/exists/PhoneExists');

const CODE_NUMBER_LIMIT = require('../../../src/helpers/const/phoneCodeProps');

module.exports = async function sendUpdatePhoneCode(req, phone, oldPhone) {
    const noSpacePhone = phone.replace(/ /g, '');
    const noSpaceOldPhone = oldPhone.replace(/ /g, '');
    const { userId } = req.accessToken;
    const userPhone = await this.app.models.Phone.findOne({ where: { baseUserId: userId } });
    if (!userPhone || noSpaceOldPhone !== userPhone.phone) {
        throw new UserPhoneNotFound();
    }
    const { isVerifyPhone } = await getTestFeatures();
    const randomCode = Math.floor(Math.random() * (CODE_NUMBER_LIMIT.max - CODE_NUMBER_LIMIT.min) + CODE_NUMBER_LIMIT.min);
    const smsCode = isVerifyPhone ? randomCode : CODE_NUMBER_LIMIT.default;
    const smsMessage = `Your update phone code for Tutoring app: ${smsCode}. Have a nice day!`;
    if (isVerifyPhone) {
        await twilioApi.sendMessage({
            body: smsMessage,
            to: noSpacePhone,
        });
    }
    const phoneModel = await this.app.models.Phone.findOne({
        where: {
            phone: noSpacePhone,
        },
        include: 'baseUser',
    });
    if (phoneModel && phoneModel.baseUserId) {
        throw new PhoneExists();
    }
    if (phoneModel) {
        phoneModel.smsCode = smsCode;
        phoneModel.used = true;
        await phoneModel.save();
    } else {
        await this.app.models.Phone.create({
            phone: noSpacePhone,
            smsCode,
            used: true,
        });
    }
    return {
        result: {
            success: true,
        },
    };
};
