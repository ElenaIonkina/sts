const ffmpeg = require('fluent-ffmpeg');
const logger = require('../utils/logger');

function scaleAndOverlayStudentOnTutorVideo(tutorVideoPath, studentVideoPath, outputVideoPath) {
    return new Promise((resolve, reject) => {
        let error;
        ffmpeg()
            .input(tutorVideoPath)
            .input(studentVideoPath)
            .complexFilter([
                '[1:v]scale=192x240:eval=frame[1scaled]',
                '[0:v]scale=720x1280:eval=frame[0scaled]',
                '[0scaled][1scaled]overlay=x=20:y=20[output]',
                '[0][1]amix=2[a]',
            ])
            .outputOptions([
                '-map [output]',
                '-map [a]',
            ])
            .output(outputVideoPath)
            .once('error', (err) => {
                error = err;
                reject(err);
            })
            .once('end', () => {
                if (!error) resolve();
            })
            .on('progress', (progress) => {
                const logData = progress.percent ? progress.percent : progress;
                logger.info(`Rendering video ${outputVideoPath} ${logData}`);
            })
            .run();
    });
}

module.exports = {
    scaleAndOverlayStudentOnTutorVideo,
};
