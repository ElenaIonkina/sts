const moment = require('moment');
const kurento = require('kurento-client');
const { emitOrDefer } = require('./deferredEvents');
const { sendDebtEvent } = require('./card');
const getSocketByBaseUserId = require('../../src/helpers/getSocketByBaseUserId');
const { releasePipeline } = require('../../src/datasource/kurento/pipelineManager');
const { addCallRequest } = require('../../src/datasource/redis/endpoints/callRequests');
const { getElements, dropElements } = require('../../src/datasource/kurento/elementsRepository');
const { dropDeferredEventsByName } = require('../../src/datasource/redis/endpoints/deferredEvents');
const { addUsersToLessons, dropUserLesson, getLessonsKeys } = require('../../src/datasource/redis/endpoints/userLessons');
const { createElementsAndGetAnswers, cacheCandidate, clearCandidateCache } = require('../../src/datasource/kurento/elementsFactory');

const TutorBusyError = require('../../src/helpers/errors/TutorBusyError');

const { BUSY, FREE } = require('../../src/helpers/const/SocketStatus');
const { STUDENT, TUTOR } = require('../../src/helpers/const/userRoles');

const START_CALL_EVENT = 'calls:start';
const CANCEL_CALL_EVENT = 'calls:cancel';
const ACCEPT_CALL_EVENT = 'calls:accept';
const DECLINE_CALL_EVENT = 'calls:decline';
const ANSWER_CALL_EVENT = 'calls:answer';
const STOP_CALL_EVENT = 'calls:stop';
const STOP_CALL_DEBT_EVENT = 'calls:stop:debt';
const STOP_CALL_REASON_EVENT = 'calls:stop:reason';
const QUARTER_LEFT_EVENT = 'calls:quarter';
const END_CALL_EVENT = 'calls:end';
const APP_CLOSED_EVENT = 'calls:app:closed';
const CAMERA_OFF_EVENT = 'calls:camera:off';
const MICROPHONE_OFF_EVENT = 'calls:microphone:off';

const START_CALL_EVENT_LIVE_MINUTES = 5;

async function sendStartCallEvent({ id, lessonId, firstName, lastName, university, grade, tutorId, avatarUrl, studentId }) {
    const tutorSocket = getSocketByBaseUserId(tutorId);
    const callData = {
        id,
        fullName: `${firstName}${lastName ? ` ${lastName}` : ''}`,
        university,
        grade,
        avatarUrl,
        lessonId,
    };
    if (tutorSocket && tutorSocket.status === BUSY) {
        throw new TutorBusyError();
    }
    const dieTime = moment().add(START_CALL_EVENT_LIVE_MINUTES, 'm').unix();
    await addCallRequest(id, lessonId, dieTime, tutorId);
    await emitOrDefer({
        event: START_CALL_EVENT,
        data: callData,
        lessonId,
        dieTime,
        receiverUserId: tutorId,
    });
    clearCandidateCache(studentId);
}

async function sendAcceptCallEvent({ lessonId, studentId, tutorId }) {
    const studentSocket = getSocketByBaseUserId(studentId);
    clearCandidateCache(tutorId);
    const tutorSocket = getSocketByBaseUserId(tutorId);
    tutorSocket.emit(ACCEPT_CALL_EVENT, {
        studentId,
        lessonId,
    });
    studentSocket.emit(ACCEPT_CALL_EVENT, {
        tutorId,
        lessonId,
    });
    studentSocket.status = BUSY;
    tutorSocket.status = BUSY;
    studentSocket.join(lessonId);
    tutorSocket.join(lessonId);
    await addUsersToLessons(tutorId, studentId, lessonId);
}

async function sendCancelCallEvent({ lessonId, studentId, tutorId }) {
    const tutorSocket = getSocketByBaseUserId(tutorId);
    if (!tutorSocket) {
        await dropDeferredEventsByName(tutorId, START_CALL_EVENT);
    } else {
        tutorSocket.emit(CANCEL_CALL_EVENT, { studentId, lessonId });
    }
}

async function sendOfferEvent({ lessonId, userId, opponentId, offer, role }) {
    const userSocket = getSocketByBaseUserId(userId);
    const opponentSocket = getSocketByBaseUserId(opponentId);
    if (opponentSocket.offer) {
        const student = getPropsByRole(role, STUDENT, userId, offer, userSocket, opponentId, opponentSocket);
        const tutor = getPropsByRole(role, TUTOR, userId, offer, userSocket, opponentId, opponentSocket);
        try {
            const [studentAnswer, tutorAnswer] =
                await createElementsAndGetAnswers(lessonId, student.id, tutor.id, student.offer, tutor.offer);
            student.socket.emit(ANSWER_CALL_EVENT, {
                answer: studentAnswer,
                tutorId: tutor.id,
                lessonId,
            });
            tutor.socket.emit(ANSWER_CALL_EVENT, {
                answer: tutorAnswer,
                studentId: student.id,
                lessonId,
            });
            delete opponentSocket.offer;
        } catch (e) {
            dropElements(lessonId);
            throw e;
        }
    } else {
        userSocket.offer = offer;
    }
}

function sendDeclineCallEvent({ lessonId, studentId, tutorId }) {
    const studentSocket = getSocketByBaseUserId(studentId);
    studentSocket.emit(DECLINE_CALL_EVENT, { tutorId, lessonId });
}

async function addCandidate(lessonId, candidate, from, role) {
    const complexCandidate = kurento.getComplexType('IceCandidate')(candidate);
    const elements = await getElements(lessonId);
    if (elements) {
        const endpoint = role === STUDENT ? elements.studentEndpoint : elements.tutorEndpoint;
        await endpoint.addIceCandidate(complexCandidate);
    } else {
        cacheCandidate(from, complexCandidate);
    }
}

async function sendStopCallEvent(lessonId, senderUserId, receiverUserId, reason) {
    const senderSocket = getSocketByBaseUserId(senderUserId);
    if (senderSocket) {
        senderSocket.status = FREE;
        senderSocket.leave(lessonId);
    }
    const receiverSocket = getSocketByBaseUserId(receiverUserId);
    await dropCall(lessonId, senderUserId, receiverUserId);
    if (!receiverSocket) return;
    receiverSocket.leave(lessonId);
    receiverSocket.status = FREE;
    if (reason) {
        receiverSocket.emit(STOP_CALL_REASON_EVENT, { lessonId, reason });
    } else {
        receiverSocket.emit(STOP_CALL_EVENT, { lessonId });
    }
}

async function dropCallWithEvents(lessonId, studentId, tutorId, event = END_CALL_EVENT) {
    const tutorSocket = getSocketByBaseUserId(tutorId);
    if (tutorSocket) {
        tutorSocket.leave(lessonId);
        tutorSocket.emit(event, { lessonId });
        tutorSocket.status = FREE;
    }
    const studentSocket = getSocketByBaseUserId(studentId);
    if (studentSocket) {
        studentSocket.leave(lessonId);
        studentSocket.emit(event, { lessonId });
        studentSocket.status = FREE;
    }
    await dropCall(lessonId, studentId, tutorId);
}

function dropCallWithDebt(lessonId, amount, currency, studentId, tutorId) {
    return Promise.all([
        sendDebtEvent(studentId, amount, lessonId, currency),
        dropCallWithEvents(lessonId, studentId, tutorId, STOP_CALL_DEBT_EVENT),
    ]);
}

async function dropCall(lessonId, studentId, tutorId) {
    await Promise.all([
        dropUserLesson(studentId),
        dropUserLesson(tutorId),
        dropElements(lessonId),
    ]);
    clearCandidateCache(studentId);
    clearCandidateCache(tutorId);
    const lessonKeys = await getLessonsKeys();
    if (lessonKeys.length) return;
    await releasePipeline();
}

function getPropsByRole(userRole, expectedRole, userId, userOffer, userSocket, opponentId, opponentSocket) {
    return userRole === expectedRole
        ? {
            id: userId,
            offer: userOffer,
            socket: userSocket,
        }
        : {
            id: opponentId,
            offer: opponentSocket.offer,
            socket: opponentSocket,
        };
}

function sendQuarterEndEvent(tutorId, studentId, secondsLeft) {
    const tutorSocket = getSocketByBaseUserId(tutorId);
    if (tutorSocket) tutorSocket.emit(QUARTER_LEFT_EVENT, { secondsLeft });
    const studentSocket = getSocketByBaseUserId(studentId);
    if (studentSocket) studentSocket.emit(QUARTER_LEFT_EVENT, { secondsLeft });
}

function sendAppClosedEvent(isClosed, userId) {
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) return;
    userSocket.emit(APP_CLOSED_EVENT, { isClosed });
}

function sendCameraOffEvent(isOff, userId) {
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) return;
    userSocket.emit(CAMERA_OFF_EVENT, { isOff });
}

function sendMicrophoneOffEvent(isOff, userId) {
    const userSocket = getSocketByBaseUserId(userId);
    if (!userSocket) return;
    userSocket.emit(MICROPHONE_OFF_EVENT, { isOff });
}

module.exports = {
    sendMicrophoneOffEvent,
    sendCameraOffEvent,
    dropCallWithEvents,
    dropCall,
    sendStopCallEvent,
    sendStartCallEvent,
    sendCancelCallEvent,
    sendOfferEvent,
    sendAcceptCallEvent,
    sendDeclineCallEvent,
    addCandidate,
    sendQuarterEndEvent,
    sendAppClosedEvent,
    dropCallWithDebt,
};
