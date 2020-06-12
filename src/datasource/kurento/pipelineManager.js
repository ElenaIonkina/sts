const { getPipeline, setPipeline, dropPipeline } = require('../../datasource/redis/endpoints/kurentoElements');
const { getKurento } = require('../../api/kurento');
const getApp = require('../../helpers/getApp');
const bluebird = require('bluebird');

let pipeline = null;
const pipelinePromise = {
    resolved: true,
};

async function getOrCreatePipeline() {
    if (pipeline) {
        pipelinePromise.resolved = true;
        return pipeline;
    }

    const pipelineData = await getPipeline();
    const kurento = getKurento();

    if (pipelineData) {
        pipeline = await kurento.getMediaobjectByIdAsync(pipelineData.pipelineId);
        pipeline = bluebird.promisifyAll(pipeline);
    } else {
        pipeline = await kurento.createAsync('MediaPipeline');
        pipeline = bluebird.promisifyAll(pipeline);
        const app = getApp();
        await pipeline.setNameAsync(`Tutoring_App_Pipeline_${app.get('instanceName')}`);
        await setPipeline(pipeline.id);
    }

    pipelinePromise.resolved = true;
    return pipeline;
}

async function releasePipeline() {
    if (!pipeline) return;
    pipeline.release();
    pipeline = null;
    await dropPipeline();
}

function getPromise() {
    if (pipelinePromise.resolved) {
        pipelinePromise.resolved = false;
        pipelinePromise.promise = getOrCreatePipeline();
    }
    return pipelinePromise.promise;
}

module.exports = {
    getOrCreatePipeline: getPromise,
    releasePipeline,
};
