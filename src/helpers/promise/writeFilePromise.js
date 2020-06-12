const fs = require('fs');
const promiseUtil = require('./promiseUtil');
const s3 = require('../../datasource/storage/s3Storage');

module.exports = (path, data, callback) => {
    callback = callback || promiseUtil.makeCallback();

    if (!s3.isUsingS3()) {
        fs.writeFile(path, data, (err) => {
            if (err) {
                console.error('Error; WriteFilePromise', err);
                return callback(err);
            }
            callback();
        });

        return callback.promise;
    } else {
        return s3.uploadFile(path, data);
    }
};
