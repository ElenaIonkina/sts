let app;
module.exports = function getApp(newApp) {
    if (newApp) app = newApp;
    return app;
};
