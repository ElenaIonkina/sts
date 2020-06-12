const { USER_LESSON } = require('../keys');
const USER_ROLES = require('../../../helpers/const/userRoles');
const redisClient = require('../client');

async function addUsersToLessons(tutorId, studentId, lessonId) {
    const redis = redisClient.getRedis();
    await Promise.all([
        redis.setAsync(getUserLessonKey(studentId), JSON.stringify({
            lessonId,
            role: USER_ROLES.STUDENT,
            studentId,
            tutorId,
        })),
        redis.setAsync(getUserLessonKey(tutorId), JSON.stringify({
            lessonId,
            role: USER_ROLES.TUTOR,
            studentId,
            tutorId,
        })),
    ]);
}

async function extendLesson(tutorId, studentId, extendTime) {
    const redis = redisClient.getRedis();
    const [studentLesson, tutorLesson] = await Promise.all([
        getUserLesson(studentId),
        getUserLesson(tutorId),
    ]);
    if (!studentLesson || !tutorLesson) return;
    studentLesson.extendedAt = extendTime;
    tutorLesson.extendedAt = extendTime;
    await Promise.all([
        redis.setAsync(getUserLessonKey(studentId), JSON.stringify(studentLesson)),
        redis.setAsync(getUserLessonKey(tutorId), JSON.stringify(tutorLesson)),
    ]);
}

async function getLessonsKeys() {
    const redis = redisClient.getRedis();
    return await redis.keysAsync(getUserLessonKey('*'));
}

async function dropUserLessons() {
    const redis = redisClient.getRedis();
    const keys = await redis.keysAsync(getUserLessonKey('*'));
    await Promise.all(keys.map(k => redis.delAsync(k)));
}

async function getUserLesson(userId) {
    const redis = redisClient.getRedis();
    const jsonLesson = await redis.getAsync(getUserLessonKey(userId));
    return JSON.parse(jsonLesson);
}

async function dropUserLesson(userId) {
    const redis = redisClient.getRedis();
    await redis.delAsync(getUserLessonKey(userId));
}

function getUserLessonKey(userId) {
    return `${USER_LESSON}:${userId}`;
}

module.exports = {
    extendLesson,
    dropUserLesson,
    addUsersToLessons,
    getUserLesson,
    getLessonsKeys,
    dropUserLessons,
};
