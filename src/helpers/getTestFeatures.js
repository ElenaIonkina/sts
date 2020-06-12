const app = require('../../server/server');

module.exports = async function getTestFeatures() {
    let isVerifyPhone;
    if (process.env.production) {
        isVerifyPhone = DEFAULT_OBJECT.verifyPhone;
    } else {
        const feature = await app.models.TestFeatures.findOne();
        isVerifyPhone = feature && feature.verifyPhone;
    }
    return { isVerifyPhone };
};

const DEFAULT_OBJECT = {
    verifyPhone: false,
};
