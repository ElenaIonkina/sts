const CardNotFoundError = require('../../../src/helpers/errors/notFound/CardNotFound');

module.exports = async function setDefaultCard(req, cardId) {
    const { userId } = req.accessToken;
    const card = await this.app.models.UserCard.findOne({
        where: {
            id: cardId,
            baseUserId: userId,
            isDeleted: false,
        },
    });
    if (!card) throw new CardNotFoundError();
    await this.app.models.BaseUser.updateAll({ id: userId }, { defaultCardId: cardId });
    return {
        result: {
            success: true,
        },
    };
};
