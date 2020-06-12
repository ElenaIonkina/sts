module.exports = function (model) {
    const result = {};
    for (let key in model) {
        if (model.hasOwnProperty(key) && !model[key].type) {
            result[key] = typeof model[key] === 'function' ? model[key] : model[key].constructor;
        }
    }
    return result;
};
