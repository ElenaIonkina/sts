const httpRequest  = require('../helpers/makeHttpRequest');
const app = require('../../server/server');

const CREATE_LINK_URL = 'https://api2.branch.io/v1/url';

async function createLinkAsync(deepLinkPath) {
    const apiKey = app.get('branchIoKey');
    const res = await httpRequest({
        url: CREATE_LINK_URL,
        method: 'POST',
        json: true,
        body: {
            'branch_key': apiKey,
            data: {
                '$deeplink_path': deepLinkPath,
            },
        },
    });
    return res.body.url;
}

module.exports = {
    createLinkAsync,
};
