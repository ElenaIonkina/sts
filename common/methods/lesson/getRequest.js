const LessonNotFoundError = require('../../../src/helpers/errors/notFound/LessonNotFound');
const { getBaseUserNotBlockedAndNotDeletedQuery, getTutorAcceptedQuery } = require('../../../src/helpers/sqlPatterns');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const userNotBlockedAndNotDeleted = getBaseUserNotBlockedAndNotDeletedQuery();
const tutorAccepted = getTutorAcceptedQuery();
const storagePaths = require('../../../src/datasource/storage/storagePaths');
module.exports = async function getRequest(req, id) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId);
    const { languageId } = user;
    const [request] = await getLessonAsync(id, userId, languageId);
    if (!request) {
        throw new LessonNotFoundError();
    }
    const [proposals, tutor, languages, photos] = await Promise.all([
        getLessonProposalsWithLanguagesAndSubjects(id, userId, languageId, this.app.models),
        getTutor(this.app.models, request, languageId, userId),
        this.app.models.Language.getLessonsLanguages([id], languageId),
        this.app.models.LessonPhoto.find({
            where: {
                lessonId: id,
            },
        }),
    ]);
    const sharedUsers = await getSharedUsers(id, this.app.models);
    return toDto(request, proposals, languages, photos, sharedUsers, tutor);
};

function toDto(request, proposals, lessonsLanguages, photos, users, tutor) {
    const lessonPhotos = photos.map(p => {
        return {
            originalUrl: storagePaths.getPicturePath() + p.originalUrl,
            previewUrl: storagePaths.getPicturePath() + p.previewUrl,
        };
    });

    const sharedUsers = users.map(u => {
        const { baseUser } = u;
        const photo = baseUser.avatar
            ? {
                originalUrl: storagePaths.getPicturePath() + baseUser.avatar.originalUrl,
                previewUrl: storagePaths.getPicturePath() + baseUser.avatar.previewUrl,
            }
            : null;
        return {
            id: baseUser.id,
            firstName: baseUser.firstName,
            lastName: baseUser.lastName,
            university: baseUser.university,
            grade: Number(baseUser.grade),
            photo,
        };
    });
    const languages = lessonsLanguages.map(l => l.translation);
    const student = {
        id: request.studentId,
        firstName: request.studentFirstName,
        lastName: request.studentLastName,
        photo: request.studentOrigUrl
            ? {
                originalUrl: storagePaths.getPicturePath() + request.studentOrigUrl,
                previewUrl: storagePaths.getPicturePath() + request.studentPrevUrl,
            }
            : null,
        city: request.studentCity,
        country: request.studentCountry,
    };
    return {
        id: request.id,
        subject: request.subject,
        description: request.description,
        duration: request.duration,
        urgency: request.urgency,
        grade: Number(request.studentGrade),
        university: request.studentUniverersity,
        priceInTimeUnit: request.priceInTimeUnitInDollars,
        recordingRelativeUrl: request.recordingUrl,
        startTime: request.startTime,
        timeTo: request.timeTo,
        timeFrom: request.timeFrom,
        languages,
        lessonPhotos,
        proposals,
        sharedUsers,
        student,
        tutor,
    };
}

async function getTutor(models, request, languageId, userId) {
    if (!request.tutorModelId) return null;
    const [languages, subjects, friend] = await Promise.all([
        models.Subject.getTutorsSubjects([request.tutorModelId], languageId),
        models.Language.getTutorsLanguages([request.tutorModelId], languageId),
        models.Friend.findOne({ where: { userId, friendId: request.tutorId } }),
    ]);

    return {
        id: request.tutorId,
        firstName: request.tutorFirstName,
        lastName: request.tutorLastName,
        photo: request.tutorOrigUrl
            ? {
                originalUrl: storagePaths.getPicturePath() + request.tutorOrigUrl,
                previewUrl: storagePaths.getPicturePath() + request.tutorPrevUrl,
            }
            : null,
        university: request.tutorUniversity,
        grade: Number(request.tutorGrade),
        city: request.tutorCity,
        country: request.tutorCountry,
        languages: languages.map(l => l.translation),
        subjects: subjects.map(s => s.translation),
        friend: Boolean(friend),
    };
}

async function getSharedUsers(lessonId, models) {
    return (await models.SharedLesson.find({
        where: {
            lessonId,
        },
        include: {
            relation: 'baseUser',
            scope: {
                include: 'avatar',
            },
        },
    })).map(s => s.toJSON());
}

function getLessonAsync(requestId, userId, languageId) {
    const lessonQuery = `SELECT Lesson.id, SubjectTranslation.translation AS subject, Lesson.description, Lesson.duration, Lesson.startTime,
                            Lesson.urgency, student.grade AS studentGrade, student.university AS studentUniverersity, Lesson.priceInTimeUnitInDollars, Lesson.recordingUrl,
                            student.firstName AS studentFirstName, student.lastName AS studentLastName, studentAvatar.originalUrl AS studentOrigUrl,
                            studentAvatar.previewUrl AS studentPrevUrl, student.id AS studentId, tutor.firstName AS tutorFirstName, tutor.lastName AS tutorLastName,
                            tutorAvatar.originalUrl AS tutorOrigUrl, tutorAvatar.previewUrl AS tutorPrevUrl, tutor.id AS tutorId, student.city AS studentCity,
                            student.country AS studentCountry, tutor.city AS tutorCity, tutor.country AS tutorCountry, Lesson.tutorId AS tutorModelId,
                            tutor.grade AS tutorGrade, tutor.university AS tutorUniversity, Lesson.timeFrom, Lesson.timeTo
                         FROM tutoring.Lesson
                            INNER JOIN tutoring.BaseUser AS student ON Lesson.baseUserId = student.id
                            LEFT JOIN tutoring.Tutor ON Lesson.tutorId = Tutor.id
                            LEFT JOIN tutoring.BaseUser AS tutor ON Tutor.baseUserId = tutor.id
                            LEFT JOIN tutoring.Photo AS studentAvatar ON student.avatarId = studentAvatar.id
                            LEFT JOIN tutoring.Photo AS tutorAvatar ON tutor.avatarId = tutorAvatar.id
                            INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                         WHERE Lesson.id = ${requestId} AND SubjectTranslation.languageId = ${languageId}
                            AND Lesson.expiredAt IS NULL AND (Lesson.isPublic = 1 OR Lesson.baseUserId = ${userId}
                                OR ${userId} IN (SELECT SharedLesson.userId FROM SharedLesson WHERE SharedLesson.lessonId = ${requestId}))
                         LIMIT 1`;
    return runMySQLQuery(lessonQuery);
}

async function getLessonProposalsWithLanguagesAndSubjects(lessonId, userId, languageId, models) {
    const proposals = await getLessonProposalsAsync(lessonId, userId);
    const tutorIds = proposals.map(p => p.tutorId);
    const [subjects, languages] = await Promise.all([
        models.Subject.getTutorsSubjects(tutorIds, languageId),
        models.Language.getTutorsLanguages(tutorIds, languageId),
    ]);
    return proposals.map(p => {
        const photo = p.originalUrl && p.previewUrl && {
            originalUrl: storagePaths.getPicturePath() + p.originalUrl,
            previewUrl: storagePaths.getPicturePath() + p.previewUrl,
        } || null;
        return {
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            grade: Number(p.grade),
            university: p.university,
            country: p.country,
            city: p.city,
            rating: Math.floor(p.rating || 0),
            proposalId: p.proposalId,
            friend: Boolean(p.friend),
            photo,
            languages: languages.filter(l => l.tutorId === p.tutorId).map(l => l.translation),
            subjects: subjects.filter(s => s.tutorId === p.tutorId).map(s => s.translation),
        };
    });
}

function getLessonProposalsAsync(lessonId, userId) {
    const proposalsQuery = `SELECT BaseUser.id, BaseUser.firstName, BaseUser.lastName, BaseUser.grade, BaseUser.university,
                                BaseUser.country, BaseUser.city, Proposal.tutorId, Proposal.id AS proposalId, Photo.originalUrl, Photo.previewUrl,
                                EXISTS(SELECT Friend.id FROM tutoring.Friend WHERE friendId = BaseUser.id AND userId = ${userId}) AS friend,
                                (SELECT (SUM(rate)/COUNT(id)) FROM tutoring.LessonRating WHERE lessonId IN (SELECT Lesson.id FROM tutoring.Lesson WHERE Lesson.finished = 1 AND Lesson.tutorId = Proposal.tutorId)) AS rating
                            FROM tutoring.Proposal
                                INNER JOIN tutoring.Tutor ON Proposal.tutorId = Tutor.id
                                INNER JOIN tutoring.BaseUser ON Tutor.baseUserId = BaseUser.id
                                LEFT JOIN tutoring.Photo ON BaseUser.avatarId = Photo.id
                            WHERE ${userNotBlockedAndNotDeleted} AND ${tutorAccepted}
                                AND Proposal.lessonId = ${lessonId}`;
    return runMySQLQuery(proposalsQuery);
}
