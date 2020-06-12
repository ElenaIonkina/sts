const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

module.exports = function renameFile(oldName, newName) {
    return fs.renameAsync(oldName, newName);
};
