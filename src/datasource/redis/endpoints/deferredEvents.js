const moment = require('moment');

const getSocketByBaseUserId = require('../../../../src/helpers/getSocketByBaseUserId');
const { DEFERRED_EVENTS } = require('../keys');
const redisClient = require('../client');

async function addDeferredEvent(userId, event, data, dieTime, from) {
    const redis = redisClient.getRedis();
    const events = await getDeferredEvents(userId);
    events.push({
        event,
        data,
        dieTime,
        from,
    });

    await redis.setAsync(getDeferredEventsKey(userId), JSON.stringify(events));
}

async function dropDeferredEvents(userId) {
    const redis = redisClient.getRedis();
    await redis.delAsync(getDeferredEventsKey(userId));
}

async function dropDeferredEventsByName(userId, event) {
    const events = await getDeferredEvents(userId);
    const cleanEvents = events.filter(e => e.event !== event);
    await setDeferredEvents(userId, cleanEvents);
}

async function getDeferredEvents(userId) {
    const redis = redisClient.getRedis();
    const currentTime = moment().unix();
    const events = JSON.parse(await redis.getAsync(getDeferredEventsKey(userId))) || [];
    const aliveEvents = events.filter(e => {
        const eventNotDies = !e.dieTime;
        const eventActive = currentTime < e.dieTime && getSocketByBaseUserId(e.from);
        return eventNotDies || eventActive;
    });
    await setDeferredEvents(userId, aliveEvents);
    return aliveEvents;
}

async function setDeferredEvents(userId, events) {
    const redis = redisClient.getRedis();
    await redis.setAsync(getDeferredEventsKey(userId), JSON.stringify(events));
}

function getDeferredEventsKey(userId) {
    return `${DEFERRED_EVENTS}:${userId}`;
}

module.exports = {
    addDeferredEvent,
    getDeferredEvents,
    dropDeferredEvents,
    dropDeferredEventsByName,
};
