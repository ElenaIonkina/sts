const uuid = require('uuid/v4');
const _ = require('lodash');
const UndefinedError = require('./errors/UndefinedError');
const ValidationError = require('./errors/ValidationError');
const app = require('../../server/server');

module.exports = function createWrapper(moduleName) {
    return function wrapper(fn, { withLog } = {}) {
        return function (...data) {
            const callback = data.slice(-1)[0];

            const started = Date.now();
            const id = uuid();

            if (withLog) {
                console.log(`${moduleName}.${fn.name}`, id);
            }
            this.app = app;
            fn.call(this, ...data.slice(0, data.length - 1))
                .then((...res) => {
                    const finished = Date.now();
                    if (withLog) {
                        console.log(`${moduleName}.${fn.name}:success`, id, `${finished - started}ms`);
                    }

                    callback(null, ...res);
                })
                .catch((err) => {
                    if (err instanceof UndefinedError) {
                        console.error(`Error; ${moduleName}.${fn.name};`, err.error.stack);
                        callback({ logError: err, backError: err.getInstance() });
                    } else if (err instanceof ValidationError) {
                        callback({ logError: err, backError: err.getInstance() });
                    } else if (err.statusCode === 422 && _.get(err, 'details.codes', false)) {
                        callback({
                            name: err.name,
                            status: err.statusCode,
                            details: {
                                messages: [_.get(err, 'details.messages', {})],
                            },
                        });
                    } else {
                        console.error(`Error; ${moduleName}.${fn.name};`, err);
                        callback({ logError: err, backError: new UndefinedError().error });
                    }
                });
        };
    };
};
