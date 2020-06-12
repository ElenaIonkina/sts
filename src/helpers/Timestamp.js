class Timestamp {
    static toTimestamp(time) {
        return Math.round(new Date(time) / 1000);
    }

    static fromTimestamp(timestamp) {
        return (timestamp * 1000);
    }
}

module.exports = Timestamp;
