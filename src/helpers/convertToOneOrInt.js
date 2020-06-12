module.exports = function convertToOneOrInt(number) {
    return number < 1 || number % 1 !== 0 ? 1 : number;
};
