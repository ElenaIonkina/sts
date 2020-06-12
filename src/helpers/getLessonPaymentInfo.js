const dinero = require('dinero.js');
const moment = require('moment');
const { MIN_TRANSACTION_AMOUNT_IN_DOLLARS } = require('../helpers/const/PayTabsLimits');

const SECONDS_IN_MINUTE = 60;
const SECONDS_FOR_FREE_CALL = 60;
const CENTS_IN_DOLLARS = 100;
const PRICE_MINUTES = 12;

function getPriceByDuration(priceInTimeUnitInDollars, duration) {
    const durationAmountDinero = dinero({ amount: priceInTimeUnitInDollars * 10 * 10 })
        .multiply(duration / PRICE_MINUTES);
    return durationAmountDinero.getAmount() / CENTS_IN_DOLLARS;
}

function getPriceBySeconds(priceInTimeUnitInDollars, seconds) {
    const minutesAmountDinero = dinero({ amount: priceInTimeUnitInDollars * 10 * 10 })
        .divide(PRICE_MINUTES)
        .multiply(seconds / SECONDS_IN_MINUTE);
    return minutesAmountDinero.getAmount() / CENTS_IN_DOLLARS;
}
function getBaseLessonPrice(priceInTimeUnitInDollars, duration = 12) {
    return getPriceByDuration(priceInTimeUnitInDollars, duration);
}
function getLessonPaymentInfo(priceInTimeUnitInDollars, duration, startTime, extendedAt, callWasBroken = false, checkExtended = true) {
    const now = moment().unix();
    const lessonNotStartedOrWasLessFreeCallSeconds = (!startTime) || (now - startTime < SECONDS_FOR_FREE_CALL);
    if (lessonNotStartedOrWasLessFreeCallSeconds) return null;

    const extendedAtAfterNow = checkExtended && extendedAt && now > extendedAt ? extendedAt : null;
    if (extendedAtAfterNow) {
        const secondsToCharge = now - extendedAtAfterNow;
        const amount = getPriceBySeconds(priceInTimeUnitInDollars, secondsToCharge);
        return { amount, paymentNumber: 1 };
    }

    if (!callWasBroken) {
        const amount = getPriceByDuration(priceInTimeUnitInDollars, duration);
        return { amount, paymentNumber: 0 };
    }

    const secondsToCharge = now - startTime;
    const amount = getPriceBySeconds(priceInTimeUnitInDollars, secondsToCharge);
    const notLowerMinAmount  = Math.max(amount, MIN_TRANSACTION_AMOUNT_IN_DOLLARS);
    return { amount: notLowerMinAmount, paymentNumber: 0 };
}

module.exports = {
    getBaseLessonPrice,
    getLessonPaymentInfo,
};
