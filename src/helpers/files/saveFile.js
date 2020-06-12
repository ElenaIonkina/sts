const path = require('path');

const StorageResource = require('../../datasource/storage/StorageResource');
const generateRandomValue = require('../generateRandomValue');

const makeDirPromise = require('../promise/makeDirPromise');
const writeFilePromise = require('../promise/writeFilePromise');
const removeFilePromise = require('../promise/removeFilePromise');

function getFilename(file, directoryPath, options) {
    const { filenamePrefix, filename } = options;

    const dir = path.join(directoryPath, generateRandomValue(16));
    const extension = path.parse(file.originalname).ext;
    const baseName = filename ? `${normalizeFilename(filename)}${extension}` : file.originalname;
    const fullName = filenamePrefix ? `${filenamePrefix}_${baseName}` : baseName;

    return path.join(dir, fullName);
}

function normalizeFilename(filename) {
    if (filename.length > 32) {
        return trimSpecials(
            normalizeNameLength(filename),
        );
    }

    return trimSpecials(filename);
}

function trimSpecials(filename) {
    return filename.replace(/[^a-zA-Z0-9]/g, '');
}

function normalizeNameLength(filename) {
    return filename.slice(0, 32);
}

/**
 * @param {Object} file
 * @param {String} directoryPath
 * @param {Object} [options]
 * @returns {Promise<StorageResource>}
 */
async function saveFile(file, directoryPath, options = {}) {
    if (!file) {
        return null;
    }

    const filePath = getFilename(file, directoryPath, options);

    const resource = new StorageResource(filePath);

    try {
        await makeDirPromise(path.parse(filePath).dir);
        resource.setUrl(await writeFilePromise(resource.getPath(), file.buffer));
    } catch (err) {
        console.error('Error; SaveFile;', err);
        removeFilePromise(resource.getPath());

        throw err;
    }

    return resource;
}

module.exports = saveFile;
