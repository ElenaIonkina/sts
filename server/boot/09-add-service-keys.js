const serviceKeys = require('../../src/helpers/const/serviceKeys');
module.exports = async function (app) {
    await app.models.ServiceKeys.findOrCreate(
        {
            where: {
                key: serviceKeys.SUPPORT_NUMBER,
            },
        },
        {
            key: serviceKeys.SUPPORT_NUMBER,
            value: '+1-999-999-99-99',
        },
    );
};
