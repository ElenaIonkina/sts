'use strict';

const bcrypt = require('bcrypt');

const DEFAULT_TTL = 1209600;
const DEFAULT_MAX_TTL = 31556926;

module.exports = function createUserModel(User) {
    User.observe('after save', (ctx, next) => {
        next();
    });

    User.prototype.createAccessToken = async function createAccessToken(ttl, options) {
        const minTtl = Math.min(ttl || DEFAULT_TTL, DEFAULT_MAX_TTL);
        return await this.accessTokens.create({ ttl: minTtl }, options);
    };

    User.logout = async function logout(tokenId) {
        await this.relations.accessTokens.modelTo.destroyById(tokenId);
    };

    User.login = async function login(credentials) {
        const user = await this.findOne({
            where: {
                email: credentials.email,
            },
        });
        if (!user) return null;
        const isMatch = await user.isPasswordValid(credentials.password);
        if (!isMatch) return null;
        return await user.createAccessToken(credentials.ttl, credentials);
    };

    User.prototype.isPasswordValid = function isPasswordValid(plain) {
        return new Promise((resolve, reject) => {
            if (this.password && plain) {
                bcrypt.compare(plain, this.password, (err, isMatch) => {
                    if (err) return reject(err);
                    resolve(isMatch);
                });
            } else {
                resolve(false);
            }
        });
    };
};
