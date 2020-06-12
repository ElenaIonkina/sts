const getUserInfo = require('./getUserInfo');

const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const InvalidStateError = require('../../../src/helpers/errors/validation/InvalidStateError');
const InvalidPostalCodeError = require('../../../src/helpers/errors/validation/InvalidPostalCodeError');
const validateUpdateBilling = require('../../../src/helpers/validators/UpdateBillingValidator');

const USA_STATES = require('../../../src/helpers/const/usaStates');
const CANADA_STATES = require('../../../src/helpers/const/CanadaStates');
const { CANADA, USA } = require('../../../src/helpers/const/CountriesToCheckPostalAndState');
const { CANADA_POSTAL_CODE_REG, USA_POSTAL_CODE_REG } = require('../../../src/helpers/const/userBillingProps');

async function validateAndGetError(models, userId, data) {
    const user = await models.BaseUser.findById(userId);
    const baseValidationError = validateUpdateBilling(data);
    if (baseValidationError) {
        return baseValidationError;
    }

    const { state, postalCode } = data;
    const isCanada = user.countryCode === CANADA;
    const isUsa = user.countryCode === USA;
    const wrongUSAState = state && isUsa && !USA_STATES.includes(state);
    const wrongCanadaState = state && isCanada && !CANADA_STATES.includes(state);
    const wrongUSAPostalCode = postalCode && isUsa && !USA_POSTAL_CODE_REG.test(postalCode);
    const wrongCanadaPostalCode = postalCode && isCanada && !CANADA_POSTAL_CODE_REG.test(postalCode);
    const notUSAState = state && !isUsa && USA_STATES.includes(state);
    const notCanadaState = state && !isCanada && CANADA_STATES.includes(state);
    const notUSAPostalCode = postalCode && !isUsa && USA_POSTAL_CODE_REG.test(postalCode);
    const notCanadaPostalCode = postalCode && !isCanada && CANADA_POSTAL_CODE_REG.test(postalCode);

    if (wrongCanadaState || wrongUSAState || notUSAState || notCanadaState) {
        return new InvalidStateError();
    }
    if (wrongCanadaPostalCode || wrongUSAPostalCode || notUSAPostalCode || notCanadaPostalCode) {
        return new InvalidPostalCodeError();
    }
}

module.exports = async function updateBillingInfo(req, address, state, city, postalCode) {
    const { userId } = req.accessToken;

    const validationError = await validateAndGetError(this.app.models, userId, { state, postalCode, city, address });
    if (validationError) {
        throw validationError;
    }

    const res = {};
    await runMySQLTransactions(async (models) => {
        const user = await models.BaseUser.findById(userId);
        if (address) {
            user.address = address;
        }
        if (state) {
            user.state = state;
        }
        if (city) {
            user.city = city;
        }
        if (postalCode) {
            user.postalCode = postalCode;
        }

        await user.save();
        res.userInfo = await getUserInfo(req, models);
    });

    return res.userInfo;
};
