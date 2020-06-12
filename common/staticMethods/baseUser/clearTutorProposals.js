/**
 * Clear selected tutors proposals, if user is tutor
 * @param {object} models - Transaction models object
 * @param {number} userId - User id to clear
 * @returns {Promise<void>}
 */
module.exports = async function clearTutorProposals(models, userId) {
    const tutor = await models.Tutor.findOne({ where: { baseUserId: userId } });
    if (!tutor) return;
    await models.Proposal.updateAll({ tutorId: tutor.id }, { selected: false });
};
