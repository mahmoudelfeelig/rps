const { getUserBuffs } = require('./applyEffects');

/* always returns ≥1 */
module.exports = function rewardMultiplier(user) {
  return getUserBuffs(user, ['reward‑multiplier'])
    .reduce((acc, b) => acc * b.effectValue, 1);
};
