module.exports = function getRequestIp(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};
