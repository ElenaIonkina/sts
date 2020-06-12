const sharp = require('sharp');
const ImageOptions = require('./ImageOptions');
module.exports = async function resizeImage(file, options) {
    const buffer = await sharp(file.buffer)
        .rotate()
        .resize({
            width: options.imageMaxWidth || ImageOptions.ORIGINAL_IMAGE.imageMaxWidth,
            height: options.imageMaxHeight || ImageOptions.ORIGINAL_IMAGE.imageMaxHeight,
            fit: 'inside',
        })
        .toBuffer()
        .catch(console.log);

    return {
        ...file,
        buffer,
        size: buffer.poolSize,
    };
};
