function inventoryQuantity(user) {
  return (user.inventory || []).reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0);
}

function portfolioPositions(user) {
  return (user.portfolio || []).filter(position => (Number(position.quantity) || 0) > 0).length;
}

function portfolioQuantity(user) {
  return (user.portfolio || []).reduce((sum, position) => sum + (Number(position.quantity) || 0), 0);
}

function progressStats(user) {
  return {
    betsPlaced: user.betsPlaced || 0,
    betsWon: user.betsWon || 0,
    storePurchases: user.storePurchases || 0,
    logins: user.loginCount || 0,
    tasksCompleted: user.tasksCompleted || 0,
    minefieldPlays: user.minefieldPlays || 0,
    minefieldWins: user.minefieldWins || 0,
    puzzleSolves: user.puzzleSolves || 0,
    clickFrenzyClicks: user.clickFrenzyClicks || 0,
    casinoPlays: user.casinoPlays || 0,
    casinoWins: user.casinoWins || 0,
    rpsPlays: user.rpsPlays || 0,
    rpsWins: user.rpsWins || 0,
    slotsPlays: user.slotsPlays || 0,
    slotsWins: user.slotsWins || 0,
    gamblingWon: user.gamblingWon || 0,
    gamblingLost: user.gamblingLost || 0,
    itemsOwned: inventoryQuantity(user),
    marketTrades: user.marketTrades || 0,
    dividendsClaimed: user.dividendsClaimed || 0,
    portfolioPositions: portfolioPositions(user),
    portfolioQuantity: portfolioQuantity(user),
    prestigeLevel: user.prestigeLevel || 0,
    balance: user.balance || 0
  };
}

module.exports = progressStats;
