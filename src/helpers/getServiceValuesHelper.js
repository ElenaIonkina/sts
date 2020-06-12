const app = require('../../server/server');

module.exports = async function getServiceValuesHelper(key) {
    return await app.models.ServiceKeys.findOne({
        where: {
            key,
        },
    });
};
