const _ = require('lodash');
const USER_ROLES = require('../../../src/helpers/const/userRoles');
const sendEmail = require('../../../src/helpers/sendEmail');
const Grades = require('../../../src/helpers/const/LocalizedGrades');
const { ADMIN_USER_INFO } = require('../../../src/helpers/const/WebClientUrls');

const InvalidUpdateDataError = require('../../../src/helpers/errors/validation/InvalidUpdateDataError');

const ContactUsValidator = require('../../../src/helpers/validators/ContactUsValidator');

module.exports = async function (req, text, grade, university) {
    const validationErr = validateAndGetError(req, grade, university);
    if (validationErr) {
        throw validationErr;
    }
    const admins = await this.app.models.BaseUser.find({ where: { role: USER_ROLES.ADMIN } });
    const message = await getMessage(this.app, req, text, grade, university);
    await Promise.all(admins.map(a => sendEmail({ ...message, to: a.email })));
    return {
        success: true,
    };
};

function validateAndGetError(req, grade, university) {
    const picture = _.get(req, 'files.transcript.0');
    if (picture && !grade && !university) {
        return new InvalidUpdateDataError();
    }
    const validationErr = picture
        ? ContactUsValidator({
            size: picture.size,
            mimetype: picture.mimetype,
            grade: grade ? String(grade) : null,
        })
        : null;
    if (validationErr) {
        return validationErr;
    }
}

async function getMessage(app, req, text, grade, university) {
    const { userId } = req.accessToken;
    const user = await app.models.BaseUser.findById(userId);
    const message = {
        subject: `New contact mail from ${user.firstName}${user.lastName ? (' ' + user.lastName) : ''}`,
        text,
    };

    const photo = _.get(req, 'files.transcript.0');
    if (photo) {
        message.subject = `New update tutor settings request from ${user.firstName}${user.lastName ? (' ' + user.lastName) : ''}`;
        message.attachments = [{
            filename: photo.originalname,
            content: photo.buffer,
        }];
        const newGrade = Object.values(Grades).find(g => g.grade === Number(grade));
        const webClientUrl = app.get('webClientUrl');
        message.text += newGrade ? `\nNew grade: ${newGrade.value}.` : '';
        message.text += university ? `\nNew university: ${university}.` : '';
        message.text += `\nUser url: ${webClientUrl}/${ADMIN_USER_INFO}${userId}`;
    }
    return message;
}
