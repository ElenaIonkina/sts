const mkdirp = require('mkdirp');
const promiseUtil = require('./promiseUtil');
const s3 = require('../../datasource/storage/s3Storage');

/**
 * @param {String} dirPath
 * @param {Function} [cb]
 * @returns {Promise}
 */
module.exports = (dirPath, cb) => {
    if (s3.isUsingS3()) return Promise.resolve();
    const callback = cb || promiseUtil.makeCallback();
    mkdirp(dirPath, callback);
    return callback.promise;
};
