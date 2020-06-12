const app = require('../../../server/server');

/**
 * @param {String} query
 * @returns {Promise}
 */
module.exports = function runMySQLQuery(query) {
    return new Promise((resolve, reject) => {
        app.dataSources.mysql.connector.execute(query, [], function (err, data) {
            if (err !== null) reject(err);
            else resolve(data);
        });
    });
};
