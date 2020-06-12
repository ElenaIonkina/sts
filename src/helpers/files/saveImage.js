const saveFile = require('./saveFile');
const resizeImage = require('./resizeImage');
const ImageOptions = require('./ImageOptions');

module.exports = async function (file, directoryPath, options = {}) {
    if (!file) return;

    const images = {
        original: await saveFile(file, directoryPath, options),
    };
    if (options && options.withPreview) {
        images.preview = await saveFile(await resizeImage(file, {
            imageMaxWidth: ImageOptions.PREVIEW_IMAGE.imageMaxWidth,
            imageMaxHeight: ImageOptions.PREVIEW_IMAGE.imageMaxHeight,
            fileName: 'preview',
            ...options,
        }), directoryPath, options);
    }

    return images;
};
