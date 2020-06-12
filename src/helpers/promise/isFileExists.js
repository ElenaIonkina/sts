const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

module.exports = async function isFileExists(path) {
    try {
        await fs.accessAsync(path);
    } catch (e) {
        return false;
    }
    return true;
};
