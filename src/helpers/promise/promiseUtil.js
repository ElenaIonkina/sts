class PromiseUtil {
    static makeCallback() {
        let callback;

        const promise = new Promise((resolve, reject) => {
            callback = (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            };
        });

        callback.promise = promise;

        return callback;
    }

    static extractPromisesQueue(queue) {
        let promise = Promise.resolve();

        queue.forEach((task) => {
            promise = promise.then(() => new Promise(task));
        });

        return promise;
    }
}

module.exports = PromiseUtil;
