const io = require('socket.io')({ serveClient: false });
const initIo = require('./controllers');

function startSocketServer(server, app) {
    io.attach(server, { pingInterval: 10000, pingTimeout: 20000 });
    initIo(io, app);
}

module.exports = {
    io,
    startSocketServer,
};
