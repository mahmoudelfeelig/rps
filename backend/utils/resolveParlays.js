const rewardMultiplier = require('../utils/rewardMultiplier');
const Bet = require('../models/Bet');

async function resolveParlays(user) {
    for (const parlay of user.parlays) {
      if (parlay.won !== null) continue;
  
      const betResults = await Promise.all(parlay.bets.map(async ({ betId, choice }) => {
        const bet = await Bet.findById(betId);
        return {
          choice,
          result: bet?.result,
        };
      }));
      const unresolved = betResults.some(({ result }) => !result);
  
      if (unresolved) continue;
  
      const allCorrect = betResults.every(({ result, choice }) => result === choice);
      parlay.won = allCorrect;
      if (allCorrect) {
        user.balance += Math.floor(parlay.amount * parlay.totalOdds * rewardMultiplier(user));
        user.betsWon += parlay.bets.length;
      }
    }
  
    await user.save();
  }

module.exports = resolveParlays;
