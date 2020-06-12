const UserListItemModel = require('../../defineModels/base-user/UserListItem');
const formatFromModel = require('../../../src/helpers/formaters/formatFromModel');
const ROLES = require('../../../src/helpers/const/userRoles');
const UserStatus = require('../../../src/helpers/const/UserStatus');
const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function fetchListOfUsers(page, perPage, tutorStatus, userStatus) {
    const where = {
        role: {
            neq: ROLES.ADMIN,
        },
    };
    if (userStatus !== UserStatus.All) {
        where.userStatus = userStatus;
    }
    if (tutorStatus !== TutorRequestStatus.All) {
        where.tutorStatus = tutorStatus;
    }
    const users = await runMySQLQuery(createDBquery(where, perPage, (page - 1) * perPage)) || [];
    const totalUsers = (await runMySQLQuery(createCountDBQuery(where)) || [{ usersCount: 0 }])[0].usersCount;

    const totalPages = Math.ceil(totalUsers / perPage);

    return {
        usersList: {
            list: users.map(user => formatFromModel(user, UserListItemModel)),
            perPage: perPage,
            page: page,
        },
        totalPages,
    };
};

const createDBquery = ({ userStatus, tutorStatus }, limit, skip) => `
    SELECT BaseUser.*, Tutor.status
    from BaseUser
             LEFT JOIN Tutor ON (Tutor.baseUserId = BaseUser.id)
    WHERE
        BaseUser.role != 'admin'
        AND BaseUser.deletedAt IS NULL
        ${tutorStatus ? `AND Tutor.status ${tutorStatus === TutorRequestStatus.NotSent ? 'IS NULL' : ` = '${tutorStatus}'`}` : ''}
        ${userStatus ? ` AND (BaseUser.userStatus = ${userStatus === 'active' ? `'${userStatus}' OR BaseUser.userStatus IS NULL` : `'${userStatus}'`})` : ''}
    ORDER BY BaseUser.id ASC
        ${limit ? `LIMIT ${limit}` : ''}
        ${limit && skip ? `OFFSET ${skip}` : ''};`;

const createCountDBQuery = ({ userStatus, tutorStatus }) => `
    SELECT count(*) as usersCount
    from BaseUser
    LEFT JOIN Tutor ON (Tutor.baseUserId = BaseUser.id)
    WHERE
        BaseUser.role != 'admin'
        AND BaseUser.deletedAt IS NULL
        ${tutorStatus ? `AND Tutor.status ${tutorStatus === TutorRequestStatus.NotSent ? 'IS NULL' : ` = '${tutorStatus}'`}` : ''}
        ${userStatus ? ` AND (BaseUser.userStatus = ${userStatus === 'active' ? `'${userStatus}' OR BaseUser.userStatus IS NULL` : `'${userStatus}'`})` : ''}
`;
