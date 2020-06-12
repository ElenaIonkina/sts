const runMySQLTransactions = require('../../../src/datasource/db/runMySQLTransactions');

const CardNotFoundError = require('../../../src/helpers/errors/notFound/CardNotFound');

module.exports = async function deleteCard(req, cardId) {
    await runMySQLTransactions(async (models) => {
        const { userId } = req.accessToken;
        const user = await models.BaseUser.findById(userId, { include: 'cards' });
        const cards = user.cards();
        const cardToDelete = cards.find(c => c.id === cardId && !c.isDeleted);
        if (!cardToDelete) throw new CardNotFoundError();
        cardToDelete.isDeleted = true;
        const promises = [cardToDelete.save()];
        if (user.defaultCardId === cardId) {
            user.defaultCardId = null;
            promises.push(user.save());
        }
        await Promise.all(promises);
    });
    return {
        result: {
            success: true,
        },
    };
};
