'use strict';

module.exports = async function (app) {
    await app.models.TestFeatures.findOrCreate({}, {});
};
