const bluebird = require('bluebird');
const kurentoClient = bluebird.promisifyAll(require('kurento-client'));
const getSocketByBaseUserId = require('../../helpers/getSocketByBaseUserId');
const { createElements } = require('./elementsRepository');

const candidates = {};

const SEND_CANDIDATE_EVENT = 'calls:candidate';

async function createElementsAndGetAnswers(lessonId, studentId, tutorId, studentOffer, tutorOffer) {
    const { studentEndpoint, tutorRecorder, tutorEndpoint, studentRecorder } = await createElements(lessonId, studentId, tutorId);
    studentEndpoint.on('OnIceCandidate', onCandidate(studentId));
    tutorEndpoint.on('OnIceCandidate', onCandidate(tutorId));

    await Promise.all([
        addCandidates(studentEndpoint),
        addCandidates(tutorEndpoint),
        studentEndpoint.connectAsync(tutorEndpoint),
        studentEndpoint.connectAsync(studentRecorder),
        tutorEndpoint.connectAsync(studentEndpoint),
        tutorEndpoint.connectAsync(tutorRecorder),
    ]);
    tutorRecorder.record();
    studentRecorder.record();

    return await Promise.all([
        generateAnswer(studentEndpoint, studentOffer),
        generateAnswer(tutorEndpoint, tutorOffer),
    ]);
}

async function generateAnswer(endpoint, offer) {
    const [answer] = await Promise.all([
        endpoint.processOfferAsync(offer),
        endpoint.gatherCandidatesAsync(),
    ]);
    return answer;
}

function onCandidate(userId) {
    return event => {
        const candidate = kurentoClient.getComplexType('IceCandidate')(event.candidate);
        const socket = getSocketByBaseUserId(userId);
        if (!socket) return;
        socket.emit(SEND_CANDIDATE_EVENT, {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
        });
    };
}

async function addCandidates(endpoint) {
    const { userId } = endpoint;
    if (!candidates[userId]) return;
    await Promise.all(candidates[userId].map(c => endpoint.addIceCandidate(c)));
    delete candidates[userId];
}

function cacheCandidate(userId, candidate) {
    candidates[userId] = candidates[userId] || [];
    candidates[userId].push(candidate);
}

function clearCandidateCache(userId) {
    delete candidates[userId];
}

module.exports = {
    createElementsAndGetAnswers,
    cacheCandidate,
    clearCandidateCache,
};
