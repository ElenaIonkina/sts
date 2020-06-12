const USER_ROLES = require('../../src/helpers/const/userRoles');

module.exports = async function (app) {
    const data = {
        admin: {
            email: 'admin@tutoring.com',
            password: 'ajhfcjanp0saVB9807advbn',
            firstName: 'Main',
            lastName: 'Admin',
            country: 'AdminLand',
            university: 'Adminersity',
            grade: '106',
            force: true,
        },
        student: {
            email: 'user@userin.com',
            password: '123456123a',
            firstName: 'usser',
            lastName: 'user',
            country: 'Usera',
            university: 'User univer',
            grade: '9',
            phone: '79848761245',
        },
        tutor: {
            email: 'tutor@tutor.com',
            password: '6542123a',
            firstName: 'tuttor',
            lastName: 'tutor',
            country: 'Tutora',
            university: 'Tutor univer',
            grade: '105',
            phone: '79848761242',
        },
    };
    for (let role in USER_ROLES) {
        role = USER_ROLES[role];
        if (role === USER_ROLES.DEBTOR) continue;
        const { email, password, firstName, lastName, country, university, grade, phone, force } = data[role];
        if (!force && !process.env.IS_DEV) continue;
        const [user, created] = await app.models.BaseUser.findOrCreate(
            {
                where: {
                    email,
                },
            },
            {
                role,
                email,
                password,
                firstName,
                lastName,
                country,
                university,
                grade,
            },
        );
        if (!created || !phone) continue;
        await app.models.Phone.create(
            {
                phone,
                smsCode: '1111',
                ttl: 2147483647,
                baseUserId: user.id,
            },
        );
    }
};
