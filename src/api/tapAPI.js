const app = require('../../server/server');
const httpRequest = require('../helpers/makeHttpRequest');

const TAP_API_KEY_SANDBOX = 'sk_test_lePb4caHXSu5jAUsOV2iM6YW';
const TAP_API_KEY_PROD = 'sk_live_hXMcK6GLAUPIdt8uajT0re7k';
const GET_TRANSACTION_INFO_URL = 'https://api.tap.company/v2/charges/';

async function tapRequest(url) {    
    const res = await httpRequest({
        url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TAP_API_KEY_SANDBOX}`
        }
    });
    return JSON.parse(res.body);
}

function getTransactionInfo(chargeId) {
    return tapRequest(GET_TRANSACTION_INFO_URL + chargeId);
}

module.exports = {
    getTransactionInfo,
};

