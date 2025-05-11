const { getUserBuffs } = require('./applyEffects');

/**
 * Compute the total multiplier on every payout.
 * E.g. one badge of effectValue=1.2 ⇒ 1.2×, two badges 1.2 & 1.1 ⇒ 1.32×, etc.
 *
 * @param {Object} user  – a Mongoose user document
 * @returns {number}     – ≥ 1, never NaN
 */
function rewardMultiplier(user) {
  const buffs = getUserBuffs(user, ['reward-multiplier']);
  const mul = buffs.reduce((acc, b) => {
    const v = Number(b.effectValue);
    return acc * (v > 0 ? v : 1);
  }, 1);
  return Number.isFinite(mul) && mul > 0 ? mul : 1;
}

module.exports = rewardMultiplier;