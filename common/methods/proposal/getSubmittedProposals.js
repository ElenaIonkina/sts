const runMySQLQuery = require('../../../src/datasource/db/runMySQLQuery');
const URGENCY = require('../../../src/helpers/const/Urgency');
const { Blocked } = require('../../../src/helpers/const/UserStatus');
const storagePaths = require('../../../src/datasource/storage/storagePaths');
module.exports = async function getSubmittedProposals(req) {
    const user = await this.app.models.BaseUser.findById(req.accessToken.userId);
    const proposalsQuery = `SELECT Proposal.id, SubjectTranslation.translation AS subject, student.grade, student.university, Lesson.priceInTimeUnitInDollars,
                    Lesson.description, Lesson.timeFrom, Lesson.timeTo, Lesson.duration, Lesson.urgency, Lesson.createdOn,
                    student.firstName, student.lastName, Lesson.id AS lessonId, studentAvatar.originalUrl AS studenOrigAvUrl, studentAvatar. previewUrl AS studentPrevAvUrl
                   FROM tutoring.Proposal
                    INNER JOIN tutoring.Lesson ON Proposal.lessonId = Lesson.id
                    INNER JOIN tutoring.Tutor ON Tutor.id = Proposal.tutorId
                    INNER JOIN tutoring.BaseUser AS tutor ON Tutor.baseUserId = tutor.id
                    INNER JOIN tutoring.BaseUser AS student ON Lesson.baseUserId = student.id
                    LEFT JOIN tutoring.SubjectTranslation ON Lesson.subjectId = SubjectTranslation.subjectId
                    LEFT JOIN tutoring.Photo AS studentAvatar ON student.avatarId = studentAvatar.id
                   WHERE tutor.id = ${user.id} AND tutor.languageId = SubjectTranslation.languageId AND Lesson.expiredAt IS NULL
                        AND Proposal.selected = 0 AND student.deletedAt IS NULL AND student.userStatus != '${Blocked}'
                        AND Lesson.finished = 0 AND Lesson.tutorId IS NULL AND Lesson.startTime IS NULL`;
    const submittedProposals = await runMySQLQuery(proposalsQuery);
    const [photos, languages] = await getPhotosAndLanguages(submittedProposals, user.languageId, this.app.models);
    return {
        submittedProposals: toDTO(submittedProposals, photos, languages),
        totalCount: submittedProposals.length,
    };
};

async function getPhotosAndLanguages(proposals, languageId, models) {
    if (!proposals.length) {
        return [[], []];
    }
    const lessonIds = proposals.map(p => p.lessonId);
    return await Promise.all([
        models.LessonPhoto.find({
            where: {
                lessonId: {
                    inq: lessonIds,
                },
            },
        }),
        models.Language.getLessonsLanguages(lessonIds, languageId),
    ]);
}

function toDTO(proposals, photos, languages) {
    return proposals
        .map(p => {
            return {
                id: p.id,
                subject: p.subject,
                description: p.description,
                timeFrom: p.timeFrom,
                timeTo: p.timeTo,
                urgency: p.urgency,
                duration: p.duration,
                createdOn: p.createdOn,
                priceInTimeUnit: p.priceInTimeUnitInDollars,
                lessonId: p.lessonId,
                lessonsPhotos: photos
                    .filter(photo => photo.lessonId === p.lessonId)
                    .map(photo => {
                        return {
                            id: photo.id,
                            originalUrl: storagePaths.getPicturePath() +  photo.originalUrl,
                            previewUrl: storagePaths.getPicturePath() + photo.previewUrl,
                        };
                    }),
                languages: languages
                    .filter(l => l.lessonId === p.lessonId)
                    .map(l => {
                        return l.translation;
                    }),
                student: {
                    university: p.university,
                    grade: Number(p.grade),
                    firstName: p.firstName,
                    lastName: p.lastName,
                    photo: p.studenOrigAvUrl && p.studentPrevAvUrl
                        ? {
                            originalUrl: storagePaths.getPicturePath() +  p.studenOrigAvUrl,
                            previewUrl: storagePaths.getPicturePath() +  p.studentPrevAvUrl,

                        }
                        : null,
                },
            };
        })
        .sort(sortByUrgency)
        .map(p => {
            delete p.createdOn;
            return p;
        });
}

const sortByUrgency = (a, b) => {
    if (a.urgency === URGENCY.Now && b.urgency === URGENCY.Now) {
        if (a.createdOn > b.createdOn) {
            return 1;
        }
        return -1;
    }
    if (a.urgency === URGENCY.Later && b.urgency === URGENCY.Later) {
        if (a.timeTo > b.timeTo) {
            return 1;
        }
        if (a.timeTo < b.timeTo) {
            return -1;
        }
        if (a.createdOn > b.createdOn) {
            return -1;
        }
        return 1;
    }
    if (a.urgency === URGENCY.Now) {
        return -1;
    }
    return 1;
};
