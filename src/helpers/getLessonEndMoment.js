const moment = require('moment');

module.exports = function (startTime, duration) {
    return moment.unix(startTime).add(duration, 'm');
};
