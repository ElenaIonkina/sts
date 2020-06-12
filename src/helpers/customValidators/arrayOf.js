const validate = require('validate.js');

validate.validators.arrayOf = function (value, options, key) {
    if (!value) return;
    if (!Array.isArray(value)) return key;
    const wrongValues = value.filter(v => typeof v !== options);
    if (wrongValues.length) return key;
};
