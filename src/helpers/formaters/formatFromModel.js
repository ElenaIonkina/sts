const _ = require('lodash');

module.exports = function formatFromModel(dataJson, model, defaultValues) {
    const result = {};
    for (let key in model) {
        if (!model.hasOwnProperty(key)) continue;
        if (typeof model[key] === 'function' || typeof model[key].type === 'function') {
            if (!model[key].type && dataJson[key]) {
                result[key] = model[key](dataJson[key]);
            } else if (!model[key].type && !dataJson[key]) {
                result[key] = typeof defaultValues === 'object'
                    ? model[key](defaultValues[key] || '')
                    : model[key]();
            } else if (model[key].type && typeof model[key].type === 'function') {
                result[key] = model[key].type(dataJson[key]);
            }
        } else if (_.get(model[key], 'dbName') && typeof _.get(model[key], 'constructor', undefined) === 'function') {
            if (dataJson[model[key].dbName]) {
                result[key] = model[key].constructor(dataJson[model[key].dbName]);
            }
        } else if (typeof model[key] === 'object' && !Array.isArray(model[key])) {
            if (!dataJson[key]) {
                result[key] = null;
                continue;
            }
            result[key] = formatFromModel(dataJson[key], model[key], _.get(defaultValues, `${key}`, undefined));
        } else if (typeof model[key] === 'object' && Array.isArray(model[key])) {
            if (!dataJson[key] || !dataJson[key].length) {
                result[key] = [];
                continue;
            }
            if (typeof model[key][0] === 'function') {
                result[key] = dataJson[key].map(item => model[key][0](item));
            } else if (typeof model[key][0] === 'object') {
                result[key] = dataJson[key].map(item => formatFromModel(item, model[key][0]));
            }
        }
    }
    return result;
};
