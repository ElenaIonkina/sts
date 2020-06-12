const LessonPriceInDollars = require('../../../src/helpers/const/LessonPriceInDollars');

module.exports = function getLessonsPrice() {
    return Promise.resolve({
        result: { price: LessonPriceInDollars },
    });
};
