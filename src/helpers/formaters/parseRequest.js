const _ = require('lodash');
module.exports = {
    parseItem: parseItem,
    parseDetails: parseDetails,
    parseForTutor: parseForTutor,
};

function parseItem(requestJSON) {
    return {
        id: requestJSON.id,
        subject: _.get(requestJSON, 'subject.name', ''),
        description: requestJSON.description,
        timeFrom: +new Date(requestJSON.timeFrom),
        timeTo: +new Date(requestJSON.timeTo),
        urgency: requestJSON.urgency,
        countWatch: requestJSON.countWatch,
        countProposals: requestJSON.countProposals,
        proposals: requestJSON.proposals.map(p => {
            return {
                id: p.baseUserId,
                firstName: p.baseUser.firstName,
                lastName: p.baseUser.lastName,
                grade: Number(p.baseUser.grade),
                university: p.baseUser.university,
                // TODO: Заполнять это поле, когда будет реализована возможность его добавлять
                photo: null,
            };
        }),
    };
}

function parseForTutor(requestJSON) {
    const photo = requestJSON.previewUrl && requestJSON.originalUrl
        ? {
            previewUrl: requestJSON.previewUrl,
            originalUrl: requestJSON.originalUrl,
        }
        : null;
    return {
        id: requestJSON.id,
        subject: requestJSON.subjectName,
        description: requestJSON.description,
        urgency: requestJSON.urgency,
        grade: Number(requestJSON.grade),
        university: requestJSON.university,
        priceInTimeUnit: requestJSON.priceInTimeUnitInDollars,
        proposals: [],
        languages: JSON.parse(requestJSON.languages),
        lessonPhotos: JSON.parse(requestJSON.lessonPhotos),
        timeFrom: +new Date(requestJSON.timeFrom),
        timeTo: +new Date(requestJSON.timeTo),
        duration: requestJSON.duration,
        student: {
            id: requestJSON.baseUserId,
            firstName: requestJSON.firstName,
            lastName: requestJSON.lastName,
            photo,
        },
    };
}

function parseDetails(requestJSON) {
    return {
        id: requestJSON.id,
        subject: _.get(requestJSON, 'subject.name', ''),
        description: requestJSON.description,
        urgency: requestJSON.urgency,
        grade: _.get(requestJSON, 'baseUser.grade'),
        university: _.get(requestJSON, 'baseUser.university'),
        priceInTimeUnit: requestJSON.priceInTimeUnitInDollars,
        photos: _.get(requestJSON, 'lessonPhotos', []).map(photo => photo.url),
        proposals: _.get(requestJSON, 'proposals', []),
    };
}
