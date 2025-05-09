const rewardMultiplier = require('../utils/rewardMultiplier');

async function resolveParlays(user) {
    for (const parlay of user.parlays) {
      if (parlay.won !== null) continue;
  
      const unresolved = parlay.bets.find(async ({ betId, choice }) => {
        const bet = await Bet.findById(betId);
        return !bet.result;
      });
  
      if (unresolved) continue;
  
      const wonAll = await Promise.all(parlay.bets.map(async ({ betId, choice }) => {
        const bet = await Bet.findById(betId);
        return bet.result === choice;
      }));
  
      const allCorrect = wonAll.every(Boolean);
      parlay.won = allCorrect;
      if (allCorrect) {
        user.balance += Math.floor(parlay.amount * parlay.totalOdds * rewardMultiplier(user));
        user.betsWon += parlay.bets.length;
      }
    }
  
    await user.save();
  }
  