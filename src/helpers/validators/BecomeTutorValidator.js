'use strict';

const AbstractFieldValidator = require('./AbstractFieldValidator');

class SignUpValidator extends AbstractFieldValidator {
    async doCheckForSingleValue(fields, options = {}) {
        const { email, languages, lastName, emailBusy, photoOfficialId, photoOfficialTranscript } = fields;

        if (AbstractFieldValidator.validateEmail(email)) {
            this.addError('email', 'errors.email.invalid');
        } else if (emailBusy) {
            this.addError('email', 'errors.email.busy');
        }

        if (AbstractFieldValidator.validateArray(languages)) {
            this.addError('languages', 'errors.languages.invalid');
        }

        if (AbstractFieldValidator.validateStringEmpty(lastName)) {
            this.addError('lastName', 'errors.lastName.empty');
        } else if (AbstractFieldValidator.validateStringMaxLength(lastName, 255)) {
            this.addError('lastName', 'errors.lastName.tooLong');
        }

        if (AbstractFieldValidator.validateFileExist(photoOfficialId)) {
            this.addError('photoOfficialId', 'errors.photoOfficialId.empty');
        }

        if (AbstractFieldValidator.validateFileExist(photoOfficialTranscript)) {
            this.addError('photoOfficialTranscript', 'errors.photoOfficialTranscript.empty');
        }

        return null;
    }
}

module.exports = SignUpValidator;
