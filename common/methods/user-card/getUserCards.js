module.exports = async function getUserCards(req) {
    const { userId } = req.accessToken;
    const user = await this.app.models.BaseUser.findById(userId, {
        include: {
            relation: 'cards',
            scope: {
                where: {
                    isDeleted: false,
                },
            },
        },
    });
    const cards = user.cards();
    return {
        result: {
            cards: cards.map(c => ({
                id: c.id,
                lastDigits: c.lastDigits,
                isDefault: c.id === user.defaultCardId,
            })),
        },
    };
};
