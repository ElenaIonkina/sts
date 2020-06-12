const moment = require('moment');
const GetPastLessonsValidator = require('../../../src/helpers/validators/GetPastLessonsValidator');
const Ranges = require('../../../src/helpers/const/PastLessonsRanges');
const LessonRoles = require('../../../src/helpers/const/LessonRoles');
const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
module.exports = async function getPastLessons(req, range) {
    const validationErr = GetPastLessonsValidator({ range });
    if (validationErr) {
        throw validationErr;
    }
    const bottomTimeTo = switchRange(range);
    const { userId } = req.accessToken;
    const { languageId } = await this.app.models.BaseUser.findById(userId);

    const pastLessonsQuery = `SELECT SubjectTranslation.translation, Lesson.description, Lesson.startTime, Lesson.baseUserId, Lesson.id, Lesson.recordingUrl,
                                tutor.firstName as tutorFirstName, tutor.lastName as tutorLastName, tutor.id as tutorId, student.firstName as studentFirstName,
                                student.lastName as studentLastName
                              FROM tutoring.Lesson
                                    INNER JOIN tutoring.Tutor ON Lesson.tutorId = Tutor.id
                                    INNER JOIN tutoring.BaseUser as student ON Lesson.baseUserId = student.id
                                    INNER JOIN tutoring.BaseUser as tutor ON Tutor.baseUserId = tutor.id
                                    INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                              WHERE Lesson.finished = 1 AND Lesson.startTime > ${bottomTimeTo} AND SubjectTranslation.languageId = ${languageId}
                                    AND (Lesson.baseUserId = ${userId} OR Tutor.baseUserId = ${userId})`;
    const sharedLessonsQuery = `SELECT SubjectTranslation.translation, Lesson.description, Lesson.startTime, Lesson.baseUserId, Lesson.id,
                                    BaseUser.firstName, BaseUser.lastName, BaseUser.id AS studentId, Photo.originalUrl, Photo.previewUrl
                                FROM tutoring.SharedLesson
                                    INNER JOIN tutoring.Lesson ON SharedLesson.lessonId = Lesson.id
                                    INNER JOIN tutoring.BaseUser ON Lesson.baseUserId = BaseUser.id
                                    INNER JOIN tutoring.Tutor ON Lesson.tutorId = Tutor.id
                                    INNER JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                                    LEFT JOIN tutoring.Photo ON Photo.id = BaseUser.avatarId
                                WHERE Lesson.finished = 1 AND Lesson.startTime > ${bottomTimeTo} AND SubjectTranslation.languageId = ${languageId}
                                    AND SharedLesson.userId = ${userId}`;
    const [pastLessons, sharedLessons] = await Promise.all([
        runMySQLQuery(pastLessonsQuery),
        runMySQLQuery(sharedLessonsQuery),
    ]);

    return {
        result: {
            pastLessons: pastLessonsToDto(pastLessons, userId),
            sharedLessons: sharedLessonsToDto(sharedLessons, userId),
        },
    };
};

function switchRange(range) {
    switch (range) {
        case Ranges.month:
            return moment().add('-1', 'M').unix();
        case Ranges.twoWeeks:
            return moment().add('-2', 'w').unix();
        default:
        case Ranges.all:
            return 0;
    }
}

function pastLessonsToDto(pastLessons, userId) {
    return pastLessons.map(l => {
        return {
            id: l.id,
            subject: l.translation,
            date: l.startTime,
            description: l.description,
            role: l.baseUserId === userId ? LessonRoles.study : LessonRoles.teach,
            student: {
                id: l.baseUserId,
                firstName: l.studentFirstName,
                lastName: l.studentLastName,
            },
            tutor: {
                id: l.tutorId,
                firstName: l.tutorFirstName,
                lastName: l.tutorLastName,
            },
        };
    }).sort(sortByDate);
}

function sharedLessonsToDto(pastLessons) {
    return pastLessons.map(l => {
        const studentPhoto = l.originalUrl && {
            originalUrl: storagePaths.getPicturePath() + l.originalUrl,
            previewUrl: storagePaths.getPicturePath() + l.previewUrl,
        };
        return {
            id: l.id,
            subject: l.translation,
            date: l.startTime,
            description: l.description,
            student: {
                id: l.studentId,
                firstName: l.firstName,
                lastName: l.lastName,
                photo: studentPhoto,
            },
        };
    }).sort(sortByDate);
}

function sortByDate(firstRequest, secondRequest) {
    if (firstRequest.date > secondRequest.date) {
        return -1;
    }
    if (firstRequest.date < secondRequest.date) {
        return 1;
    }
    return 0;
}
