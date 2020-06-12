/* eslint-disable */ // TODO

const _ = require('lodash');
const camelCase = require('camelcase');

const defaultConfig = require('../config.json');

module.exports = generateConfig();

function generateConfig() {
  return {
    ...defaultConfig,
    ...readConfig(),
  };
}

function readConfig() {
  if (process.env.LOCAL_CONFIG_FILE) return require('./local');
  return _.mapKeys(process.env, (value, key) => camelCase(key));
}
