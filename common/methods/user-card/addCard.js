const { createAddCardLink } = require('../../../src/api/payTabsApi');
const getRequestIp = require('../../../src/helpers/getRequestIp');
const hasEveryKey = require('../../../src/helpers/hasEveryKey');
const InvalidBillingInformationError = require('../../../src/helpers/errors/validation/InvalidBillingInformationError');

const USER_FIELDS_TO_ADD_CARD = ['country', 'city', 'address', 'postalCode', 'lastName', 'firstName', 'email', 'state'];

module.exports = async function addCard(req) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId, { include: 'phone' });
    const { phone } = user.phone();
    const isUserCanAddCard = hasEveryKey(user, USER_FIELDS_TO_ADD_CARD) && phone;
    if (!isUserCanAddCard) {
        throw new InvalidBillingInformationError();
    }
    const userIp = getRequestIp(req);
    const link = await createAddCardLink(user, phone, userIp);
    return {
        result: {
            link,
        },
    };
};
