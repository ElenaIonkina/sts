const _ = require('lodash');
const TutorRequestStatus = require('../../../src/helpers/const/TutorRequestStatus');
const formatFromModel = require('../../../src/helpers/formaters/formatFromModel');

const StatusModel = require('../../defineModels/tutor/Status');

module.exports = async function getBecomeTutorStatus(req) {
    const user = await this.app.models.BaseUser.findById(
        _.get(req, 'accessToken.userId'),
        {
            include: ['tutor'],
        },
    );
    const tutorSettings = user.toJSON().tutor;
    return formatFromModel(tutorSettings || { status: TutorRequestStatus.NotSent }, StatusModel);
};
