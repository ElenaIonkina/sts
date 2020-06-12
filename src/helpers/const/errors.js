const errors = {
    notFound: {
        userNotFound: 'errors.userNotFound',
        languageNotFound: 'errors.languageNotFound',
        subjectNotFound: 'errors.subjectNotFound',
        proposalNotFound: 'errors.proposalNotFound',
        lessonNotFound: 'errors.lessonNotFound',
        emailNotFound: 'errors.emailNotFound',
        cardNotFound: 'errors.cardNotFound',
        tokenNotFound: 'errors.tokenNotFound',
        userSocketNotFound: 'errors.userSocketNotFound',
        selectedTutorNotFound: 'errors.selectedTutorNotFound',
        friendNotFound: 'errors.friendNotFound',
        userPhoneNotFound: 'errors.userPhoneNotFound',
        countryNotFound: 'errors.countryNotFound',
    },
    admin: {
        deleteAdmin: 'errors.deleteAdmin',
        blockAdmin: 'errors.blockAdmin',
    },
    validation: {
        baseValidation: 'errors.baseValidation',
        invalidPhone: 'errors.invalidPhone',
        invalidState: 'errors.invalidState',
        invalidPostalCode: 'errors.invalidPostalCode',
        invalidUpdateData: 'errors.invalidUpdateData',
        invalidBillingInformation: 'errors.invalidBillingInformation',
    },
    exists: {
        usersExists: 'errors.userExists',
        emailExists: 'errors.emailExists',
        phoneExists: 'errors.phoneExists',
    },
    serviceError: 'errors.serviceError',
    userBlocked: 'errors.userBlocked',
    wrongLessonUrgency: 'errors.wrongLessonUrgency',
    wrongSmsCode: 'errors.wrongSmsCode',
    userNotInLesson: 'errors.userNotInLesson',
    tutorBusy: 'errors.tutorBusy',
};

module.exports = errors;
