'use strict';

module.exports = (app, callback) => {
    app.dataSources.mysql.autoupdate(null, callback);
};
