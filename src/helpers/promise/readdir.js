const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

module.exports = function readdir(directory) {
    return fs.readdirAsync(directory);
};
