'use strict';

const loopback = require('loopback');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const boot = require('loopback-boot');
const storagePaths = require('../src/datasource/storage/storagePaths');
const FILE_PROPS = require('../src/helpers/const/fileProps');
const { startSocketServer } = require('../socket');
const setApp = require('../src/helpers/getApp');
const { initRedis } = require('../src/datasource/redis/client');
const { initKurento } = require('../src/api/kurento');
require('../src/helpers/customValidators');

const app = loopback();

app.use(cookieParser('yourSecretKeyForCookies'));

app.use(
    multer()
        .fields([
            {
                name: 'photo',
                mimeType: FILE_PROPS.PHOTO_MIME_TYPES,
            },
            {
                name: 'transcript',
                mimeType: FILE_PROPS.PHOTO_MIME_TYPES,
            },
            {
                name: 'photoOfficialId',
                mimeType: FILE_PROPS.PHOTO_MIME_TYPES,
            },
            {
                name: 'photoOfficialTranscript',
                mimeType: FILE_PROPS.PHOTO_MIME_TYPES,
            },
            {
                name: 'picture',
                mimetype: FILE_PROPS.PHOTO_MIME_TYPES,
            },
        ]),
);

app.use(
    loopback.token({
        model: app.models.AccessToken,
        currentUserLiteral: 'me',
    }),
);

module.exports = app;

app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        let baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        setStaticServer();
        if (app.get('loopback-component-explorer')) {
            let explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

function setStaticServer() {
    const restApiRoot = app.get('restApiRoot');
    const publicDirectory = storagePaths.getRootDirectory();
    const publicRecordingsDirectory = storagePaths.getRootRecordingsDirectory();
    app.use(`${restApiRoot}/files`, loopback.static(publicDirectory));
    app.use('/api/files', loopback.static(publicDirectory));
    app.use('/api/recordings', loopback.static(publicRecordingsDirectory));

    if (!app.get('disableSocketDoc')) {
        app.use('/socketDoc', loopback.static('./doc'));
    }
}

const bootOptions = {
    appRootDir: __dirname,
    bootScripts: [
        './boot/00-root',
        './boot/01-authentication',
        './boot/02-database-migration-mysql',
        './boot/03-enable-test-feature',
        './boot/04-register-roles',
        './boot/05-run-scheduled-tasks',
        './boot/06-create-requests-and-subjects',
        './boot/07-create-users-and-phones',
        './boot/08-rename-countMsg',
        './boot/09-add-service-keys',
        './boot/10-migrate-languages',
        './boot/11-add-languages-with-translations-and-migrate',
        './boot/12-add-subjects-with-translations-and-migrate',
        './boot/13-urgency-to-lower',
        './boot/14-fix-unix-ms-to-s',
        './boot/15-empty',
        './boot/16-schedule-clean-recordings',
        './boot/17-add-country-codes',
    ],
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootOptions, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {
        const server = app.start();
        startSocketServer(server, app);
        setApp(app);
        initRedis(app).then(() => {
            initKurento(app).catch(() => process.exit(1));
        }).catch(() => process.exit(1));
    }
});
