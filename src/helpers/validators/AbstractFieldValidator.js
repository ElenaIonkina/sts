const validator = require('validator');
const _ = require('lodash');

const ValidationError = require('../errors/ValidationError');

class AbstractFieldsValidator {
    constructor() {
        this.error = new ValidationError();
    }

    validate(fields, options) {
        this.error = new ValidationError();
        this.doCheckForSingleValue(fields, options);
        this.doCheckForRelations(fields, options);

        return this.error;
    }

    async validateAsync(fields, options) {
        this.error = new ValidationError();
        await this.doCheckForSingleValue(fields, options);

        return this.error;
    }

    doCheckForSingleValue() {

    }

    doCheckForRelations() {

    }

    getErrors() {
        return this.getErrorInstance().details.messages;
    }

    getError() {
        return this.error;
    }

    getErrorInstance() {
        return this.error.getInstance();
    }

    addError(field, error) {
        this.error.add(field, error);
        return this.error;
    }

    hasErrors() {
        return Object.values(this.getErrors())
            .some(v => Boolean(v));
    }

    validateEmail(key, value, prefix) {
        const errorPrefix = prefix ? `errors.${prefix}` : 'errors';

        if (AbstractFieldsValidator.validateStringEmpty(value)) {
            this.addError(key, `${errorPrefix}.email.empty`);
        } else if (AbstractFieldsValidator.validateEmail(value)) {
            this.addError(key, `${errorPrefix}.email.invalid`);
        }
    }

    validatePassword(key, value, prefix) {
        const errorPrefix = prefix ? `errors.${prefix}` : 'errors';

        if (AbstractFieldsValidator.validateStringEmpty(value)) {
            this.addError(key, `${errorPrefix}.password.empty`);
        } else if (AbstractFieldsValidator.validateStringLength(value, 4)) {
            this.addError(key, `${errorPrefix}.password.empty`);
        }
    }

    static validateStringEmpty(string) {
        return !string || !_.trim(string);
    }

    static validateStringEqual(first, second) {
        return _.trim(first) !== _.trim(second);
    }

    static validateInteger(number) {
        return (number % 1 !== 0);
    }

    static validateStringLength(string, length) {
        return _.trim(string).length === length;
    }

    static validateStringMinLength(string, minLength) {
        return _.trim(string).length < minLength;
    }

    static validateStringMaxLength(string, maxLength) {
        return _.trim(string).length > maxLength;
    }

    static validateStringRegex(string, regex) {
        return string && !regex.test(string);
    }

    static validateNumber(number) {
        return isNaN(number);
    }

    static validateNumberMinValue(number, minValue) {
        return number < minValue;
    }

    static validateNumberMaxValue(number, maxValue) {
        return number > maxValue;
    }

    static validateEmail(email) {
        return !validator.isEmail(email);
    }

    static validateEnum(enumObject, value) {
        return !Object.values(enumObject).includes(value.toLowerCase());
    }

    static validateArray(array) {
        return !array || !array.length;
    }

    static validateArrayIncludes(array, includes) {
        return array.every(item => !includes.includes(item));
    }

    static validateArrayMaxLength(array, length) {
        return array.length > length;
    }

    static validateValueIncludes(value, includes) {
        return !includes.includes(value);
    }

    static validatePositiveValue(value) {
        return value < 0;
    }

    static validateMomentDate(date) {
        return !date || !date.isValid();
    }

    static validateMomentDateMinValue(date, maxValue, unit = 'milliseconds') {
        return date.diff(maxValue, unit) <= 0;
    }

    static validateMomentDateMaxValue(date, maxValue, unit = 'milliseconds') {
        return date.diff(maxValue, unit) > 0;
    }

    static validateUrl(url) {
        return !validator.isURL(url);
    }

    static validateObjectIncludeValue(object, value) {
        return !_.has(_.invert(object), value);
    }

    static validateFileSize(file, maxSize) {
        return file.size > maxSize;
    }

    static validateFileExist(file) {
        return !file;
    }

    static validatePhoneNumber(string) {
        return !validator.isMobilePhone(string, 'any');
    }

    static validateZipCode(string) {
        return !validator.isPostalCode(string, 'any');
    }

    static validateDate(date) {
        return !date;
    }
}

module.exports = AbstractFieldsValidator;
