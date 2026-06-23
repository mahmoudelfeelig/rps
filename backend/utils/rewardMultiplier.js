const { getUserBuffs } = require('./applyEffects');


function rewardMultiplier(user) {
  const buffs = getUserBuffs(user, ['reward-multiplier']);
  const mul = buffs.reduce((acc, b) => {
    const v = Number(b.effectValue);
    return acc * (v > 0 ? v : 1);
  }, 1);
  const prestige = 1 + (Number(user?.prestigeLevel) || 0) * 0.1;
  const total = mul * prestige;
  return Number.isFinite(total) && total > 0 ? total : 1;
}

module.exports = rewardMultiplier;
