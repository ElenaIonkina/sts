const fs = require('fs');
const promiseUtil = require('./promiseUtil');
const s3 = require('../../datasource/storage/s3Storage');

module.exports = (path, callback) => {
    callback = callback || promiseUtil.makeCallback();

    if (!s3.isUsingS3()) {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.error('Error; ReadFilePromise', err);
                return callback(err);
            }

            callback(null, data);
        });

        return callback.promise;
    } else {
        return s3.readFile(path);
    }
};
