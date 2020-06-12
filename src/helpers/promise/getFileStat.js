const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

module.exports = function getFileStat(path) {
    return fs.statAsync(path);
};
