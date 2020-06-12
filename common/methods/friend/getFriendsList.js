const { Blocked } = require('../../../src/helpers/const/UserStatus');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');

module.exports = async function getListFriends(req) {
    const { userId } = req.accessToken;
    const { languageId } = await this.app.models.BaseUser.findById(userId);
    const friends = await getFriends(userId, languageId, this.app.models);
    const friendDto = await toDto(friends);
    return {
        result: {
            friends: friendDto,
        },
    };
};

async function toDto(friends) {
    return Promise.all(friends.filter(f => f.friend).map(async f => {
        const { friend } = f;
        const photo = friend.avatar
            ? {
                originalUrl: storagePaths.getPicturePath() +  friend.avatar.originalUrl,
                previewUrl: storagePaths.getPicturePath() + friend.avatar.previewUrl,
            }
            : null;
        const tutorId = friend.tutor.id;
        const languages = friend.tutor.tutorLanguages.map(l => l.languageTranslations[0].translation);
        const subjects = friend.tutor.subjects.map(s => s.subjectTranslations[0].translation);
        const query = ` (SELECT (SUM(rate)/COUNT(id)) AS rating
                        FROM tutoring.LessonRating
                        WHERE lessonId IN (SELECT Lesson.id FROM tutoring.Lesson WHERE Lesson.finished = 1 AND Lesson.tutorId = ${tutorId}))`;
        console.error(query);
        const [{ rating }] = await runMySQLQuery(query);
        return {
            id: friend.id,
            firstName: friend.firstName,
            lastName: friend.lastName,
            grade: Number(friend.grade),
            university: friend.university,
            city: friend.city,
            country: friend.country,
            rating: Math.floor(rating || 0),
            photo,
            languages,
            subjects,
        };
    }));
}

async function getFriends(userId, languageId, models) {
    const friends = await models.Friend.find({
        include: {
            relation: 'friend',
            scope: {
                include: [
                    {
                        relation: 'tutor',
                        scope: {
                            include: [
                                {
                                    relation: 'tutorLanguages',
                                    scope: {
                                        include: {
                                            relation: 'languageTranslations',
                                            scope: {
                                                where: {
                                                    translationLanguageId: languageId,
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    relation: 'subjects',
                                    scope: {
                                        include: {
                                            relation: 'subjectTranslations',
                                            scope: {
                                                where: {
                                                    languageId,
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        relation: 'avatar',
                    },
                ],
                where: {
                    deletedAt: null,
                    userStatus: {
                        neq: Blocked,
                    },
                },
            },
        },
        where: {
            userId,
        },
    });
    return friends.map(f => f.toJSON());
}
