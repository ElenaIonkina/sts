const addAuthCookie = require('../../../src/helpers/addAuthCookie');
const EmailNotFoundError = require('../../../src/helpers/errors/notFound/EmailNotFound');

module.exports = async function login(res, email, password) {
    const accessToken = await this.app.models.BaseUser.login({
        email,
        password,
    });
    if (!accessToken) throw new EmailNotFoundError();
    addAuthCookie(res, accessToken);
    return true;
};
