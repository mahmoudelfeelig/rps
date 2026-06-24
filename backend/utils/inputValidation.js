const MAX_SAFE_COINS = 1_000_000_000;

function positiveInt(value, { min = 1, max = MAX_SAFE_COINS } = {}) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

function positiveMoney(value, { min = 1, max = MAX_SAFE_COINS } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return Math.floor(number);
}

module.exports = {
  MAX_SAFE_COINS,
  positiveInt,
  positiveMoney
};
