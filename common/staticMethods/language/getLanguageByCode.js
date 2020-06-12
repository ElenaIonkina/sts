const app = require('../../../server/server');

module.exports = function getLanguageByCode(languageCode) {
    return app.models.Language.findOne({ where: { code: languageCode } });
};
