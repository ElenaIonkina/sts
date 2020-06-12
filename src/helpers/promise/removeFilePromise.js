const rimraf = require('rimraf');
const promiseUtil = require('./promiseUtil');
const s3 = require('../../datasource/storage/s3Storage');

/**
 * @param {String} path
 * @param {Object} options
 * @param {Function} [callback]
 * @return {Promise}
 */
module.exports = (path, options = {}, callback) => {
    callback = callback || promiseUtil.makeCallback();

    if (!s3.isUsingS3() || options.isLocal) {
        rimraf(path, options || {}, (err) => {
            if (err) {
                console.error('Error: RemoveFilePromise error;', err);
                return callback(err);
            }

            callback();
        });
        return callback.promise;
    } else {
        if (options.isDirectory) {
            return s3.emptyS3Directory(path);
        }
        return s3.remove(path);
    }
};
