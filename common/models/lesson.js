'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Lesson');
const app = require('../../server/server');
const rateLesson = require('../methods/lesson/rateLesson');
const createRequest = require('../methods/lesson/createRequest');
const removeRequest = require('../methods/lesson/removeRequest');
const fetchRequests = require('../methods/lesson/fetchRequests');
const fetchRequestsForTutor = require('../methods/lesson/fetchRequestsForTutor');
const getRequest = require('../methods/lesson/getRequest');
const sendProposal = require('../methods/lesson/sendProposal');
const tutorWatch = require('../methods/lesson/tutorWatch');
const getAccess = require('../methods/lesson/getAccess');
const selectTutor = require('../methods/lesson/selectTutor');
const getUpcomingLessons = require('../methods/lesson/getUpcomingLessons');
const startLesson = require('../methods/lesson/startLesson');
const getPastLessons = require('../methods/lesson/getPastLessons');
const getRequests = require('../methods/lesson/getRequests');
const getLink = require('../methods/lesson/getLink');
const getLessonsPrice = require('../methods/lesson/getLessonsPrice');
const shareLesson = require('../methods/lesson/shareLesson');
const getPastLessonsList = require('../methods/lesson/getPastLessonsList');

const deletePhotosOnRollback = require('../methods/lesson/after-save/deletePhotosOnRollback');

const OwnRequest = require('../defineModels/lesson/OwnRequest');
const RequestForTutor = require('../defineModels/lesson/RequestForTutor');
const PriceList = require('../defineModels/lesson/PriceList');
const DetailedRequest = require('../defineModels/lesson/DetailedRequest');
const NewRequestModel = require('../defineModels/lesson/NewRequest');
const Photo = require('../defineModels/image/Photo');
const FetchRequestProposal = require('../defineModels/proposal/fetchRequestProposal');
const UpcomingLesson = require('../defineModels/lesson/UpcomingLesson');
const UpcomingProposal = require('../defineModels/lesson/UpcomingProposalModel');
const UpcomingStudent = require('../defineModels/lesson/UpcomingStudentModel');
const PastLessonsModel = require('../defineModels/lesson/PastLessons');
const PastLessonModel = require('../defineModels/lesson/PastLesson');
const PastSharedLessonModel = require('../defineModels/lesson/PastSharedLesson');
const LessonLinkResponseModel = require('../defineModels/lesson/LessonLinkResponse');
const RequestsListModel = require('../defineModels/lesson/RequestsList');
const ListRequestModel = require('../defineModels/lesson/ListRequest');
const SharedUserInfoModel = require('../defineModels/lesson/SharedUserInfo');
const ShortUserInfoModel = require('../defineModels/lesson/ShortUserInfo');
const ShortUserTutorInfoModel = require('../defineModels/lesson/ShortUserTutorInfo');
const AdminPastLessonsListModel = require('../defineModels/lesson/AdminPastLessonsList');
const AdminPastLessonsListItemModel = require('../defineModels/lesson/AdminPastLessonsListItem');

module.exports = function createLessonModel(Lesson) {
    defineLessonModels();
    Lesson.remoteMethod('rateLesson', {
        http: { path: '/rate-lesson', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'number', required: true },
            { arg: 'rate', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Rate tutor by lessonId May return following error: errors.baseValidation(...) 422; errors.serviceError 500. No id in result!!!',
    });
    Lesson.rateLesson = wrapper(rateLesson);

    Lesson.remoteMethod('createRequest', {
        http: { path: '/create-request', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'Array of photos' },
            { arg: 'subjectId', type: 'number', required: true },
            { arg: 'languages', type: ['string'], default: [], required: true },
            { arg: 'description', type: 'string' },
            { arg: 'paymentType', type: 'any', description: 'Card' },
            { arg: 'discount', type: 'string', description: 'promoCode' },
            { arg: 'urgency', type: 'string', required: true, description: 'Enum(now|later)' },
            { arg: 'timeFrom', type: 'number', description: 'Timestamp', required: true },
            { arg: 'timeTo', type: 'number', description: 'Timestamp', required: true },
            { arg: 'duration', type: 'number', required: true },
            { arg: 'listOfFriends', type: 'any' },
            { arg: 'cardId', type: 'number' },
        ],
        returns: [
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Creates new lesson request. May return following error: errors.baseValidation(...) 422; ' +
            'errors.languageNotFound, errors.friendNotFound, errors.cardNotFound, errors.subjectNotFound 404; errors.serviceError 500. No id in result!!!',
    });

    Lesson.createRequest = wrapper(createRequest);

    Lesson.remoteMethod('removeRequest', {
        http: { path: '/remove-request', verb: 'delete' },
        accepts: [
            { arg: 'id', type: 'number' },
        ],
        returns: { arg: 'success', type: 'object', root: true },
    });

    Lesson.removeRequest = wrapper(removeRequest);
    Lesson.localRemoveRequest = removeRequest;

    Lesson.remoteMethod('fetchRequests', {
        http: { path: '/fetch-requests', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'limit', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: ['OwnRequest'], root: true },
            { arg: 'totalCount', type: 'number' },
        ],
    });

    Lesson.fetchRequests = wrapper(fetchRequests);

    Lesson.remoteMethod('fetchRequestsForTutor', {
        http: { path: '/fetch-requests-for-tutor', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'subjects', type: ['number'] },
            { arg: 'urgency', type: 'string' },
            { arg: 'limit', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: ['RequestForTutor'], root: true },
            { arg: 'totalCount', type: 'number' },
        ],
    });

    Lesson.fetchRequestsForTutor = wrapper(fetchRequestsForTutor);

    Lesson.remoteMethod('getRequest', {
        http: { path: '/request', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'id', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'DetailedRequest', root: true },
        ],
    });

    Lesson.getRequest = wrapper(getRequest);

    Lesson.remoteMethod('sendProposal', {
        http: { path: '/send-proposal', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'id', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'object', root: true },
        ],
    });

    Lesson.sendProposal = wrapper(sendProposal);

    Lesson.remoteMethod('tutorWatch', {
        http: { path: '/tutorWatch/increase', verb: 'put' },
        accepts: [
            { arg: 'id', type: 'number', required: true },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });

    Lesson.tutorWatch = wrapper(tutorWatch);

    Lesson.remoteMethod('selectTutor', {
        http: { path: '/selectTutor/:proposalId', verb: 'put' },
        description: 'Selects tutor for lesson',
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'proposalId', type: 'number' },
        ],
        returns: [
            { arg: 'success', type: 'boolean', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
    });

    Lesson.selectTutor = wrapper(selectTutor);

    Lesson.remoteMethod('getUpcomingLessons', {
        http: { path: '/upcomingLessons', verb: 'get' },
        description: 'Get user\'s upcoming lessons',
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'upcomingLessons', type: ['UpcomingLesson'], root: true },
            { arg: 'totalCount', type: 'number', root: true },
        ],
    });

    Lesson.getUpcomingLessons = wrapper(getUpcomingLessons);

    Lesson.remoteMethod('startLesson', {
        http: { path: '/startLesson/:proposalId', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'proposalId', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Sends calls:start event to tutor for start specific lesson, tutor must be selected for the lesson, student must be connected to the socket server.' +
            'May return following error: errors.lessonNotFound, errors.selectedTutorNotFound, errors.userSocketNotFound 404; errors.tutorBusy 409; errors.serviceError 500.',
    });

    Lesson.startLesson = wrapper(startLesson);

    Lesson.remoteMethod('getPastLessons', {
        http: { path: '/past', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'range', type: 'string', description: 'Enum (all|month|2weeks)' },
        ],
        returns: [
            { arg: 'result', type: 'PastLessons', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Returns past completed lessons with custom range from current time. Default value for range = all. May return following error: errors.serviceError 500. No id, photo, city, country,  in result!!!',
    });

    Lesson.getPastLessons = wrapper(getPastLessons);

    Lesson.remoteMethod('getRequests', {
        http: { path: '/requests', verb: 'get' },
        accepts: [
            { arg: 'page', type: 'number' },
            { arg: 'perPage', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'RequestsList', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Admin method for getting current lesson requests. May return following error: errors.serviceError 500. No id in result!!!',
    });

    Lesson.getRequests = wrapper(getRequests);

    Lesson.remoteMethod('shareLesson', {
        http: { path: '/share/:lessonId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'number' },
            { arg: 'users', type: ['number'], required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Share lesson with users. May return following errors: errors.lessonNotFound, errors.userNotFound 404; errors.serviceError 500. No id in result!!!',
    });

    Lesson.shareLesson = wrapper(shareLesson);

    Lesson.remoteMethod('getPastLessonsList', {
        http: { path: '/pastList', verb: 'get' },
        accepts: [
            { arg: 'page', type: 'number' },
            { arg: 'perPage', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'AdminPastLessonsList', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Admin method for getting all past lessons. May return following errors: errors.serviceError 500. No id in result!!!',
    });

    Lesson.getPastLessonsList = wrapper(getPastLessonsList);

    Lesson.remoteMethod('getLink', {
        http: { path: '/link/:lessonId', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'number' },
        ],
        returns: [
            { arg: 'result', type: 'LessonLinkResponse', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Method for getting lesson sharing link. May return following errors: errors.lessonNotFound 404; errors.serviceError 500. No id in result!!!',
    });

    Lesson.getLink = wrapper(getLink);

    Lesson.remoteMethod('getAccess', {
        http: { path: '/access/:token', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'token', type: 'string' },
        ],
        returns: [
            { arg: 'result', type: 'DetailedRequest', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Method for getting access to lesson by sharing link token. May return following errors: errors.tokenNotFound 404; errors.serviceError 500. No id in result!!!',
    });

    Lesson.getAccess = wrapper(getAccess);

    Lesson.remoteMethod('getPrice', {
        http: { path: '/price', verb: 'get' },
        accepts: [
        ],
        returns: [
            { arg: 'result', type: 'PriceList', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Method for getting lessons price list in price object like {grade: price, ...}.  May return following errors: errors.serviceError 500. No id in result!!!',
    });

    Lesson.getPrice = wrapper(getLessonsPrice);

    Lesson.observe('after save', deletePhotosOnRollback);
};

const defineLessonModels = () => {
    app.dataSources.db.define('RequestForTutor', RequestForTutor);
    app.dataSources.db.define('ShortUserInfo', ShortUserInfoModel);
    app.dataSources.db.define('ShortUserTutorInfo', ShortUserTutorInfoModel);
    app.dataSources.db.define('OwnRequest', OwnRequest);
    app.dataSources.db.define('SharedUserInfo', SharedUserInfoModel);
    app.dataSources.db.define('DetailedRequest', DetailedRequest);
    app.dataSources.db.define('NewRequest', NewRequestModel);
    app.dataSources.db.define('Photo', Photo);
    app.dataSources.db.define('FetchRequestProposal', FetchRequestProposal);
    app.dataSources.db.define('UpcomingLesson', UpcomingLesson);
    app.dataSources.db.define('UpcomingProposal', UpcomingProposal);
    app.dataSources.db.define('UpcomingStudent', UpcomingStudent);
    app.dataSources.db.define('PastSharedLesson', PastSharedLessonModel);
    app.dataSources.db.define('PastLesson', PastLessonModel);
    app.dataSources.db.define('LessonLinkResponse', LessonLinkResponseModel);
    app.dataSources.db.define('PastLessons', PastLessonsModel);
    app.dataSources.db.define('PriceList', PriceList);
    app.dataSources.db.define('ListRequest', ListRequestModel);
    app.dataSources.db.define('RequestsList', RequestsListModel);
    app.dataSources.db.define('AdminPastLessonsList', AdminPastLessonsListModel);
    app.dataSources.db.define('AdminPastLessonsListItem', AdminPastLessonsListItemModel);
};
