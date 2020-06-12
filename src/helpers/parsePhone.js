const libphonenumber = require('libphonenumber-js/max');

module.exports = function parsePhone(phone, countryCode) {
    return libphonenumber.parsePhoneNumberFromString(phone, countryCode);
};
