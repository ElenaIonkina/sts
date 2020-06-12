const _ = require('lodash');

const USER_ROLES = require('../../src/helpers/const/userRoles');

module.exports = (app) => {
    app.models.Role.registerResolver('Admin', RoleResolver(app, [USER_ROLES.ADMIN]));
    app.models.Role.registerResolver('Tutor', RoleResolver(app, [USER_ROLES.TUTOR, USER_ROLES.ADMIN]));
    app.models.Role.registerResolver('Student', RoleResolver(app, [USER_ROLES.STUDENT, USER_ROLES.TUTOR, USER_ROLES.ADMIN]));
    app.models.Role.registerResolver('MayBeDebtor', RoleResolver(app, [USER_ROLES.DEBTOR, USER_ROLES.STUDENT, USER_ROLES.TUTOR, USER_ROLES.ADMIN]));
    app.models.Role.registerResolver('CommonUser', RoleResolver(app, [USER_ROLES.STUDENT, USER_ROLES.TUTOR, USER_ROLES.ADMIN]));
};

const RoleResolver = (app, roles) => (methodRole, ctx, cb) => {
    const reject = rejectResolver(cb);
    const userId = _.get(ctx, 'accessToken.userId', null);
    if (!userId) {
        return reject();
    }

    checkUserRole(app, userId, roles)
        .then(result => cb(null, result))
        .catch((err) => {
            console.error('Error; register-roles', err);
            return cb(null, false);
        });
};

async function checkUserRole(app, userId, roles) {
    const user = await app.models.BaseUser.findById(userId);
    return user && roles.includes(_.toLower(user.role || 'student'));
}

const rejectResolver = (cb) => () => {
    process.nextTick(() => {
        cb(null, false);
    });
};
