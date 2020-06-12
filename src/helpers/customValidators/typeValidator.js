const validate = require('validate.js');

validate.validators.type = function (value, options, key) {
    if (!value) return;
    if (typeof value !== options) return key;
};
