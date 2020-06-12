const app = require('../../server/server');
const ResultModel = require('../defineModels/common/Result');
const BaseErrorModel = require('../defineModels/common/BaseError');
const UrlPhotoModel = require('../defineModels/common/UrlPhoto');
const formatDefineFromModel = require('../../src/helpers/formaters/formatDefineFromModel');

module.exports = function createCommonModels() {
    app.dataSources.db.define('Result', formatDefineFromModel(ResultModel));
    app.dataSources.db.define('BaseError', formatDefineFromModel(BaseErrorModel));
    app.dataSources.db.define('UrlPhoto', formatDefineFromModel(UrlPhotoModel));
};
