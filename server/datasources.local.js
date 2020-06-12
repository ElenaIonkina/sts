'use strict';

const config = require('./datasources.json');
const localConfig = require('./config/index.js');

module.exports = {
    mysql: {
        ...config.mysql,
        database: process.env.MYSQL_DATABASE || 'tutoring',
        host: process.env.MYSQL_HOST || 'localhost',
        password: process.env.MYSQL_ROOT_PASSWORD || localConfig.mySqlRootPassword,
    },
    email: {
        ...config.email,
        transports: [
            {
                type: 'smtp',
                host: 'smtp.gmail.com',
                secure: true,
                port: 465,
                tls: {
                    rejectUnauthorized: false,
                },
                auth: {
                    user: localConfig.emailUser,
                    pass: localConfig.emailPassword,
                },
            },
        ],
    },
};
