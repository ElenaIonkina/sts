const app = require('../../server/server');

module.exports = async function getServiceValuesHelper(keys) {
    return await app.models.ServiceKeys.find({
        where: {
            key: { inq: keys },
        },
    });
};
