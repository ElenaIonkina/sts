const _ = require('lodash');

module.exports = function hasEveryKey(object, keys) {
    return _.every(keys, (k) => object[k]);
};
