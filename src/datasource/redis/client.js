const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const logger = require('../../utils/logger');

let redisClient = null;

function initRedis(app) {
    return new Promise((resolve, reject) => {
        if (redisClient) {
            return resolve(redisClient);
        }
        const client = redis.createClient({
            host: app.get('redisHost') || 'localhost',
            password: app.get('redisPass'),
            port: 6379,
        });
        client.on('connect', () => {
            redisClient = client;
            redisClient._app = app;
            resolve(redisClient);
        });
        client.on('error', (err) => {
            if (!redisClient) {
                reject(err);
            }
            logger.error(err);
        });
    });
}

function getRedis() {
    return redisClient;
}

module.exports = {
    initRedis,
    getRedis,
};
