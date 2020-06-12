const getServiceValuesHelper = require('../../../src/helpers/getServiceValuesHelper');
const serviceKeys = require('../../../src/helpers/const/serviceKeys');

module.exports = async function getSupportNumber() {
    const number = await getServiceValuesHelper(serviceKeys.SUPPORT_NUMBER);
    if (!number) {
        return {
            error: {
                message: 'errors.noSupportNumber',
            },
        };
    }
    return {
        supportNumber: number.value,
    };
};
