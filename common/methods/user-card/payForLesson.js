const { chargeNewCard } = require('../../../src/api/payTabsApi');
const getRequestIp = require('../../../src/helpers/getRequestIp');
const hasEveryKey = require('../../../src/helpers/hasEveryKey');
const { getBaseLessonPrice } = require('../../../src/helpers/getLessonPaymentInfo');
const payLessonOrderId = require('../../../src/helpers/payLessonOrderId');
const InvalidBillingInformationError = require('../../../src/helpers/errors/validation/InvalidBillingInformationError');
const s3 = require('../../../src/datasource/storage/s3Storage');

const USER_FIELDS_TO_ADD_CARD = ['country', 'city', 'address', 'postalCode', 'lastName', 'firstName', 'email', 'state'];

module.exports = async function payForLesson(req, lessonId) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId, { include: 'phone' });
    const { phone } = user.phone();
    const isUserCanAddCard = hasEveryKey(user, USER_FIELDS_TO_ADD_CARD) && phone;
    if (!isUserCanAddCard) {
        throw new InvalidBillingInformationError();
    }
    const userIp = getRequestIp(req);

    const lesson = await this.app.models.Lesson.findById(lessonId);
    const amount = getBaseLessonPrice(lesson.priceInTimeUnitInDollars, lesson.duration);
    const currency = s3.isUsingS3() ? 'KWD' : 'USD';
    const orderId = payLessonOrderId.generateOrderId(lesson.id, userId);
    const transactionInfo = await this.app.models.TransactionInfo.create({
        amount,
        currency,
        lessonId,
        orderId,
    });
    const link = await chargeNewCard(user, phone, userIp, orderId, amount, currency);
    return {
        result: {
            link,
        },
    };
};
