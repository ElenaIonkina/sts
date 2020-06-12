const path = require('path');
const storagePaths = require('./storagePaths');

class StorageResource {
    static fromUrl(url) {
        if (!url) {
            return null;
        }

        const relativePath = decodeURI(url).replace(storagePaths.getRootUrl(), '/');
        const resourcePath = path.join(storagePaths.getRootDirectory(), relativePath);
        return new StorageResource(resourcePath);
    }

    constructor(resourcePath) {
        this.resourcePath = resourcePath;
        this.url = null;
    }

    getPath() {
        return this.resourcePath;
    }

    getDirectory() {
        return path.parse(this.resourcePath).dir;
    }

    getFilename() {
        return path.parse(this.resourcePath).base;
    }

    getFilenameWithoutExtension() {
        return path.parse(this.resourcePath).name;
    }

    getUrl() {
        if (this.url) return this.url;

        const relativePath = this._extractRelativeToPath();
        return storagePaths.getRootUrl() + relativePath;
    }

    setUrl(url) {
        if (typeof url !== 'string') return;

        this.url = url;
    }

    getRelativeUrl() {
        const relativePath = this._extractRelativeToPath();
        return `local|${storagePaths.getRelativeUrl()}${relativePath}`;
    }

    _extractRelativeToPath() {
        const filePath = path.normalize(this.resourcePath);
        const rootPath = path.normalize(storagePaths.getRootDirectory());

        return filePath.replace(rootPath, '').replace(/\\/g, '/');
    }

    getKey() {
        return this._extractRelativeToPath();
    }
}

module.exports = StorageResource;
