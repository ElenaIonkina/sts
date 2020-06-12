module.exports = function addRoutes(socket) {
};

/**
 * @api {message} connect
 * @apiVersion 0.1.0
 * @apiName Connection to server
 * @apiDescription User connection to server
 * @apiGroup UsersSocketMessages
 *
 * @apiParam {String} token - Access token from query
 * @apiParamExample {json} Connect with token example:
 * connect?token=abc123
 * @apiSuccess {event} login:success - Events on successful connection and valid token
 * */

/**
 * @api {event} messages:new
 * @apiVersion 0.1.0
 * @apiName New message event
 * @apiDescription Events on new message
 * @apiGroup LessonsSocketEvents
 * @apiParam {Number} id - Message id
 * @apiParam {Date} createdAt - Date of message
 * @apiParam {Number} timestamp - Unix timestamp in seconds
 * @apiParam {String} type - Message type(photo or message)
 * @apiParam {String} [text] - Text of message, if type = message
 * @apiParam {Object} [photo] - Object with 2 string properties: originalUrl and previewUrl. Relative path to photo, if type = photo
 **/

/**
 * @api {event} login:success
 * @apiVersion 0.1.0
 * @apiName Success login
 * @apiDescription Events after connection with correct token
 * @apiGroup LessonsSocketEvents
 **/

/**
 * @api {event} login:failed
 * @apiVersion 0.1.0
 * @apiName Failed login
 * @apiDescription Events after connection with incorrect token. After it server disconnects socket
 * @apiGroup LessonsSocketEvents
 **/

/**
 * @api {event} login:new
 * @apiVersion 0.1.0
 * @apiName New connection
 * @apiDescription Events after connection with same from another. After it server disconnects socket
 * @apiGroup LessonsSocketEvents
 **/

/**
 * @api {event} calls:start
 * @apiVersion 0.1.0
 * @apiName Start lesson
 * @apiPermission Tutor
 * @apiDescription Events for tutor after user pressed send start lesson request
 * @apiGroup CallsSocketEvents
 * @apiParam {Number} id - Student id
 * @apiParam {String} fullName - Student's full name
 * @apiParam {String} university - Student's university
 * @apiParam {Number} grade - Student's grade
 * @apiParam {String} avatarUrl - Student's avatar relative url
 * @apiParam {Number} lessonId - Started lesson id
 **/

/**
 * @api {event} calls:accept
 * @apiVersion 0.1.0
 * @apiName Accepted call
 * @apiDescription Events for users after tutor accepted call and student and tutor can send chat messages
 * @apiGroup CallsSocketEvents
 * @apiParam {Number} lessonId - Accepted lesson id
 * @apiParam {Number} studentId - Student's id
 * @apiParam {Number} tutorId - Tutor's id
 **/

/**
 * @api {event} calls:stop:debt
 * @apiVersion 0.1.0
 * @apiName Stop call by debt
 * @apiDescription Events for users after trying continue lesson without money for paying first lesson part
 * @apiGroup CallsSocketEvents
 * @apiParam {Number} lessonId - Current lesson id
 **/

/**
 * @api {event} calls:answer
 * @apiVersion 0.1.0
 * @apiName Answer call
 * @apiDescription Events for users after they sent offers
 * @apiGroup CallsSocketEvents
 * @apiParam {Number} lessonId - Accepted lesson id
 * @apiParam {Number} studentId/tutorId - Student/tutor's id
 * @apiParam {String} answer - Sdp answer
 **/

/**
 * @api {event} calls:decline
 * @apiVersion 0.1.0
 * @apiName Declined lesson
 * @apiPermission Student
 * @apiDescription Events for student after tutor declined call
 * @apiGroup CallsSocketEvents
 * @apiParam {Number} lessonId - Accepted lesson id
 * @apiParam {Number} studentId - Student's id
 * @apiParam {Number} tutorId - Tutor's id
 **/

/**
 * @api {event} calls:candidate
 * @apiVersion 0.1.0
 * @apiName Call candidate
 * @apiDescription Events for opponent, when other opponent sends candidate
 * @apiGroup CallsSocketEvents
 * @apiParam {string} sdpMid - sdpMid
 * @apiParam {number} sdpMLineIndex - sdpMLineIndex
 * @apiParam {string} candidate - candidate
 **/

/**
 * @api {event} calls:stop
 * @apiVersion 0.1.0
 * @apiName Stop call
 * @apiDescription Events for opponent, when other opponent stops current call
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 **/

/**
 * @api {event} calls:cancel
 * @apiVersion 0.1.0
 * @apiName Cancel start call
 * @apiDescription Events for tutor, when student cancels current call
 * @apiPermission Tutor
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 * @apiParam {number} studentId - Student's id
 **/

/**
 * @api {event} calls:user:left
 * @apiVersion 0.1.0
 * @apiName User left event
 * @apiDescription Events for user, when opponent lost socket connection
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 **/

/**
 * @api {event} calls:user:right
 * @apiVersion 0.1.0
 * @apiName User right event
 * @apiDescription Events for user, when opponent restored socket connection
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 **/

/**
 * @api {event} calls:stop:reason
 * @apiVersion 0.1.0
 * @apiName Cancel with reason
 * @apiPermission Student
 * @apiDescription Events for student, when tutor stops call with reason
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 * @apiParam {string} reason - Stop reason
 **/

/**
 * @api {event} calls:end
 * @apiVersion 0.1.0
 * @apiName Lesson end
 * @apiDescription Events for student and tutor, when lesson time ends
 * @apiGroup CallsSocketEvents
 * @apiParam {number} lessonsId - Current lesson id
 **/

/**
 * @api {event} calls:quarter
 * @apiVersion 0.1.0
 * @apiName Lesson quarter left
 * @apiDescription Events for student and tutor, when quarter lesson left
 * @apiGroup CallsSocketEvents
 * @apiParam {number} secondsLeft - Seconds left to the end of lesson
 **/

/**
 * @api {event} calls:app:closed
 * @apiVersion 0.1.0
 * @apiName App is closed
 * @apiDescription Events for opponent, when user collapse app
 * @apiGroup CallsSocketEvents
 * @apiParam {boolean} isClosed - App collapsed or not
 **/

/**
 * @api {event} calls:camera:off
 * @apiVersion 0.1.0
 * @apiName Camera off
 * @apiDescription Events for opponent, when user disable camera
 * @apiGroup CallsSocketEvents
 * @apiParam {boolean} isOff - Camera disabled or not
 **/

/**
 * @api {event} calls:microphone:off
 * @apiVersion 0.1.0
 * @apiName Microphone off
 * @apiDescription Events for opponent, when user disable microphone
 * @apiGroup CallsSocketEvents
 * @apiParam {boolean} isOff - Microphone disabled or not
 **/

/**
 * @api {event} user:card:add
 * @apiVersion 0.1.0
 * @apiName Add card
 * @apiDescription Events, when card added successful
 * @apiGroup UserCardSocketEvents
 * @apiParam {number} cardId - Card id
 * @apiParam {string} lastDigits - Last card four digits
 **/

/**
 * @api {event} user:card:fail
 * @apiVersion 0.1.0
 * @apiName Adding card failed
 * @apiDescription Events, when failed to card for payment system reason
 * @apiGroup UserCardSocketEvents
 **/

/**
 * @api {event} user:card:pending
 * @apiVersion 0.1.0
 * @apiName Pending add card
 * @apiDescription Events, when unable to add card now for technical reasons and card will be tried to add later
 * @apiGroup UserCardSocketEvents
 **/

/**
 * @api {event} user:card:debt
 * @apiVersion 0.1.0
 * @apiName User become debtor
 * @apiDescription Events, when unable to pay lesson
 * @apiGroup UserCardSocketEvents
 * @apiParam {number} amount - Debt amount
 * @apiParam {number} lessonId - Not paid lesson id
 * @apiParam {string} currency - Debt currency
 **/

/**
 * @api {event} user:debt:fail
 * @apiVersion 0.1.0
 * @apiName Failed pay debt
 * @apiDescription Events, when unable to debt
 * @apiGroup UserCardSocketEvents
 **/

/**
 * @api {event} user:debt:success
 * @apiVersion 0.1.0
 * @apiName Success pay debt
 * @apiDescription Events, when debt was paid and user not debtor anymore
 * @apiGroup UserCardSocketEvents
 **/
