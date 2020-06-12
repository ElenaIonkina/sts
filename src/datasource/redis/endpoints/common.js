const redisClient = require('../client');

async function setValue(key, value) {
    const redis = redisClient.getRedis();
    await redis.setAsync(key, JSON.stringify(value));
}

async function dropValue(key) {
    const redis = redisClient.getRedis();
    await redis.delAsync(key);
}

async function getValue(key) {
    const redis = redisClient.getRedis();
    const valueJson = await redis.getAsync(key);
    return JSON.parse(valueJson);
}

module.exports = {
    setValue,
    dropValue,
    getValue,
};
