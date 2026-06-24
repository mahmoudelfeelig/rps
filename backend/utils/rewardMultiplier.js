const { getUserBuffs } = require('./applyEffects');
const { prestigeMultiplier } = require('./prestige');

function rewardMultiplier(user) {
  const buffs = getUserBuffs(user, ['reward-multiplier']);
  const itemMultiplier = buffs.reduce((acc, buff) => {
    const value = Number(buff.effectValue);
    return acc * (value > 0 ? value : 1);
  }, 1);
  const total = itemMultiplier * prestigeMultiplier(user?.prestigeLevel || 0);
  return Number.isFinite(total) && total > 0 ? total : 1;
}

module.exports = rewardMultiplier;
