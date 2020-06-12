'use strict';

const packageJson = require('../../package.json');

module.exports = function getRestApiRoot() {
    const tokens = packageJson.version.split(/\./);
    const majorToken = tokens.shift();
    const majorVersion = Number(majorToken);

    return '/api/v' + majorVersion;
};
