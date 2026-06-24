const BASE_PRESTIGE_THRESHOLD = 500000;
const PRESTIGE_GROWTH_RATE = 1.85;
const PRESTIGE_RESET_BALANCE = 1000;

function prestigeThreshold(level = 0) {
  const safeLevel = Math.max(0, Number(level) || 0);
  return Math.round(BASE_PRESTIGE_THRESHOLD * Math.pow(PRESTIGE_GROWTH_RATE, safeLevel));
}

function prestigeMultiplier(level = 0) {
  const safeLevel = Math.max(0, Number(level) || 0);
  const multiplier = Math.pow(1.12, safeLevel);
  return Number(multiplier.toFixed(3));
}

module.exports = {
  BASE_PRESTIGE_THRESHOLD,
  PRESTIGE_GROWTH_RATE,
  PRESTIGE_RESET_BALANCE,
  prestigeMultiplier,
  prestigeThreshold
};
