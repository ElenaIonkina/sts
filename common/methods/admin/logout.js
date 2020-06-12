const _ = require('lodash');

module.exports = async function logout(req) {
    await this.app.models.BaseUser.logout(_.get(req, 'accessToken.id', null));
    return true;
};
