const app = require('../../server/server');
const promiseUtil = require('./promise/promiseUtil');

/**
 * Send email
 * @param {Object} options
 * @param {String} options.to
 * @param {String} options.subject
 * @param {String} [options.html]
 * @param {String} [options.text]
 * @param {Function} [callback]
 */
async function sendEmail(options, callback) {
    callback = callback || promiseUtil.makeCallback();

    options.from = {
        name: app.get('projectName'),
        address: app.get('contactEmail'),
    };

    options.text = options.text || 'new email';

    app.models.Email.send(options, (err, result) => callback(err, result));

    return callback.promise;
}

module.exports = sendEmail;
