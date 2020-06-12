let slack = null;

const SlackWebHook = require('slack-webhook');
const getApp = require('../../src/helpers/getApp');

function getSlack() {
    if (!slack) {
        const app = getApp();
        if (!app) return null;
        const slackUrl = app.get('slackUrl');
        const instanceName = app.get('instanceName');
        const slackChannel = app.get('slackChannel');
        if (!slackUrl || !instanceName || !slackChannel) return null;
        slack = new SlackWebHook(slackUrl, {
            defaults: {
                channel: slackChannel,
            },
        });
        slack.instanceName = instanceName;
    }
    return slack;
}

module.exports = {
    getSlack,
};

