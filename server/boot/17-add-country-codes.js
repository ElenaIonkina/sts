const runMySQLTransactions = require('../../src/datasource/db/runMySQLTransactions');
const COUNTRY_CODES = require('../../src/helpers/const/CountryCodes');

module.exports = async function addCountryCodes(app) {
    const migrateCountryCodes = app.get('migrateCountryCodes');
    if (!migrateCountryCodes) return;
    await runMySQLTransactions(async (models) => {
        const users = await models.BaseUser.find();
        return Promise.all(users.map(u => {
            const country = COUNTRY_CODES.find(c => c.name === u.country);
            if (country) u.countryCode = country['alpha-3'];
            else u.countryCode = COUNTRY_CODES[0]['alpha-3'];
            return u.save();
        }));
    });
};
