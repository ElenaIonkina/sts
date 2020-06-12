const _ = require('lodash');
const USER_ROLES = require('../../../src/helpers/const/userRoles');

module.exports = async function checkSession(req) {
    const { accessToken } = req;
    if (!accessToken) {
        return { isAuth: false };
    }
    const user = await this.app.models.BaseUser.findById(accessToken.userId);
    if (!user || user.role !== USER_ROLES.ADMIN) {
        return { isAuth: false };
    }
    accessToken.created = new Date();
    await accessToken.save();
    return { isAuth: true };
};
