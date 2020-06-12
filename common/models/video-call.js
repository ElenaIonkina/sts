'use strict';
const wrapper = require('../../src/helpers/createWrapper')('VideoCall');
const app = require('../../server/server');

const acceptCall = require('../methods/video-call/acceptCall');
const declineCall = require('../methods/video-call/declineCall');
const sendCandidate = require('../methods/video-call/sendCandidate');
const sendOffer = require('../methods/video-call/sendOffer');
const stopCall = require('../methods/video-call/stopCall');
const stopCallWithReason = require('../methods/video-call/stopCallWithReason');
const cancelCall = require('../methods/video-call/cancelCall');
const extendCall = require('../methods/video-call/extend');
const getCredentials = require('../methods/video-call/getCredentials');
const sendAppClosed = require('../methods/video-call/sendAppClosed');
const sendCameraOff = require('../methods/video-call/sendCameraOff');
const sendMicrophoneOff = require('../methods/video-call/sendMicrophoneOff');

const CredentialsModel = require('../defineModels/video-call/Credentials');
const TurnCredentialModel = require('../defineModels/video-call/TurnCredential');
const StunCredentialModel = require('../defineModels/video-call/StunCredential');

module.exports = function createVideoCallModel(VideoCall) {
    defineVideoCallModels();

    VideoCall.remoteMethod('acceptCall', {
        http: { path: '/acceptCall/:lessonId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Send accept call event for student. May return following error: errors.lessonNotFound, errors.userSocketNotFound 404; errors.serviceError 500.',
    });

    VideoCall.acceptCall = wrapper(acceptCall);

    VideoCall.remoteMethod('declineCall', {
        http: { path: '/declineCall/:lessonId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'lessonId', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Send decline call event for student. May return following error: errors.lessonNotFound, errors.userSocketNotFound 404; errors.serviceError 500.',
    });

    VideoCall.declineCall = wrapper(declineCall);

    VideoCall.remoteMethod('sendOffer', {
        http: { path: '/sendOffer', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'offer', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Send offer to the current call. After events calls:answer for user. May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });
    VideoCall.sendOffer = wrapper(sendOffer);

    VideoCall.remoteMethod('sendCandidate', {
        http: { path: '/sendCandidate', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'sdpMid', type: 'string', required: true },
            { arg: 'sdpMLineIndex', type: 'number', required: true },
            { arg: 'candidate', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Send candidate to the server. May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.sendCandidate = wrapper(sendCandidate);

    VideoCall.remoteMethod('stopCall', {
        http: { path: '/stopCall', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Stops current call opponent. After events calls:stop for opponent. May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.stopCall = wrapper(stopCall);

    VideoCall.remoteMethod('stopCallWithReason', {
        http: { path: '/stopCallReason', verb: 'post' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'reason', type: 'string', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Stops current call with reason. After events calls:stop:reason for opponent. May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.stopCallWithReason = wrapper(stopCallWithReason);

    VideoCall.remoteMethod('cancelCall', {
        http: { path: '/cancelCall/:proposalId', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'proposalId', type: 'number', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'object', root: true },
        ],
        description: 'Cancels call request. After events calls:cancel for tutor. May return following error: errors.userSocketNotFound, errors.proposalNotFound 404; errors.serviceError 500.',
    });

    VideoCall.cancelCall = wrapper(cancelCall);

    VideoCall.remoteMethod('getCredentials', {
        http: { path: '/credentials', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'result', type: 'Credentials', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Get turn and stun servers info for video calls. NO ID IN RESULT!!! May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.getCredentials = wrapper(getCredentials);

    VideoCall.remoteMethod('sendAppClosed', {
        http: { path: '/collapse', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'isClosed', type: 'boolean', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Send calls:app:closed event with isClosed for lesson opponent. NO ID IN RESULT!!! May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.sendAppClosed = wrapper(sendAppClosed);

    VideoCall.remoteMethod('sendCameraOff', {
        http: { path: '/off/camera', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'isOff', type: 'boolean', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Send calls:camera:off event with isOff for lesson opponent. NO ID IN RESULT!!! May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.sendCameraOff = wrapper(sendCameraOff);

    VideoCall.remoteMethod('sendMicrophoneOff', {
        http: { path: '/off/microphone', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
            { arg: 'isOff', type: 'boolean', required: true },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Send calls:microphone:off event with isOff for lesson opponent. NO ID IN RESULT!!! May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.sendMicrophoneOff = wrapper(sendMicrophoneOff);

    VideoCall.remoteMethod('extendCall', {
        http: { path: '/extend', verb: 'put' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'result', type: 'Result', root: true },
            { arg: 'error', type: 'BaseError', root: true },
        ],
        description: 'Extends current lesson. NO ID IN RESULT!!! May return following error: errors.userNotInLesson 400; errors.serviceError 500.',
    });

    VideoCall.extendCall = wrapper(extendCall);
};

const defineVideoCallModels = () => {
    app.dataSources.db.define('Credentials', CredentialsModel);
    app.dataSources.db.define('TurnCredential', TurnCredentialModel);
    app.dataSources.db.define('StunCredential', StunCredentialModel);
};
