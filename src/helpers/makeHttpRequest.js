const request = require('request');

/**
 * Make http request
 * @param {object} data
 * @param {string} data.url
 * @param {string} data.method
 * @param {object} [data.body] - Request body
 * @returns {Promise<Object>}
 */
module.exports = function httpRequest(data) {
    return new Promise((resolve, reject) => {
        request(data, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};
