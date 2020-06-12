'use strict';
const wrapper = require('../../src/helpers/createWrapper')('Lesson');
const getSubmittedProposals = require('../methods/proposal/getSubmittedProposals');
const app = require('../../server/server');

const SubmittedProposal = require('../defineModels/proposal/submittedProposal');

module.exports = function createProposalModel(Proposal) {
    defineProposalsModels();
    Proposal.remoteMethod('getSubmittedProposals', {
        http: { path: '/submittedProposals', verb: 'get' },
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' }, description: 'For access token' },
        ],
        returns: [
            { arg: 'submittedProposals', type: '[SubmittedProposal]', root: true },
            { arg: 'totalCount', type: 'Number', root: true },
        ],
    });

    Proposal.getSubmittedProposals = wrapper(getSubmittedProposals);
};

const defineProposalsModels = () => {
    app.dataSources.db.define('SubmittedProposal', SubmittedProposal);
};
