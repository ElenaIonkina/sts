const twilioApi = require('../../../src/api/twilioApi');
const getTestFeatures = require('../../../src/helpers/getTestFeatures');
const USER_STATUSES = require('../../../src/helpers/const/UserStatus');
const UserBlockedError = require('../../../src/helpers/errors/UserBlockedError');

const CODE_NUMBER_LIMIT = require('../../../src/helpers/const/phoneCodeProps');

module.exports = async function sendVerificationCode(phone) {
    const { isVerifyPhone } = await getTestFeatures();
    const noSpacePhone = phone.replace(/ /g, '');
    const randomCode = Math.floor(Math.random() * (CODE_NUMBER_LIMIT.max - CODE_NUMBER_LIMIT.min) + CODE_NUMBER_LIMIT.min);
    const smsCode = isVerifyPhone ? randomCode : CODE_NUMBER_LIMIT.default;
    const smsMessage = `Your verification code for Tutoring app: ${smsCode}. Have a nice day!`;
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
    const baseUser = phoneModel && phoneModel.baseUser && phoneModel.baseUser();
    if (baseUser && baseUser.userStatus === USER_STATUSES.Blocked) {
        throw new UserBlockedError();
    }
    if (phoneModel) {
        phoneModel.smsCode = smsCode;
        phoneModel.used = false;
        await phoneModel.save();
    } else {
        await this.app.models.Phone.create({
            phone: noSpacePhone,
            smsCode,
        });
    }
    return {
        result: {
            success: true,
        },
    };
};
