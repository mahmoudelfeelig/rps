const RPS_BOTS = require('./rpsBots');

function botSymbol(name) {
  return name
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

const rpsMemberAssets = RPS_BOTS.map((bot, index) => {
  const seed = index + 1;
  return {
    symbol: `RPS-${botSymbol(bot.name)}`,
    name: bot.name,
    category: 'rps-member',
    description: bot.quip,
    risk: Number((0.35 + (seed % 4) * 0.12).toFixed(2)),
    basePrice: 120 + seed * 35,
    dividendYield: Number((0.012 + (seed % 3) * 0.004).toFixed(3)),
    volatility: Number((0.06 + (seed % 5) * 0.025).toFixed(3)),
    linkedTo: bot.name
  };
});

module.exports = [
  ...rpsMemberAssets,
  {
    symbol: 'PARK',
    name: 'Patchwork Index',
    category: 'stock',
    description: 'A diversified index built around the whole app economy.',
    risk: 0.28,
    basePrice: 100,
    dividendYield: 0.015,
    volatility: 0.04
  },
  {
    symbol: 'WAVE',
    name: 'Wave Tech',
    category: 'stock',
    description: 'Steady growth with occasional momentum spikes.',
    risk: 0.46,
    basePrice: 180,
    dividendYield: 0.022,
    volatility: 0.09
  },
  {
    symbol: 'NODE',
    name: 'Node Works',
    category: 'stock',
    description: 'High conviction software plays with sharp swings.',
    risk: 0.62,
    basePrice: 240,
    dividendYield: 0.018,
    volatility: 0.12
  },
  {
    symbol: 'BTCX',
    name: 'BitFlux',
    category: 'crypto',
    description: 'Fast, speculative, and always moving.',
    risk: 0.88,
    basePrice: 320,
    dividendYield: 0,
    volatility: 0.22
  },
  {
    symbol: 'ETHR',
    name: 'Ether Drift',
    category: 'crypto',
    description: 'Volatile upside with stronger long-term retention.',
    risk: 0.78,
    basePrice: 260,
    dividendYield: 0,
    volatility: 0.18
  },
  {
    symbol: 'CALL',
    name: 'Call Burst',
    category: 'option',
    description: 'Levered upside with aggressive drawdown risk.',
    risk: 0.96,
    basePrice: 75,
    dividendYield: 0,
    volatility: 0.34
  },
  {
    symbol: 'PUTS',
    name: 'Put Shield',
    category: 'option',
    description: 'A defensive derivative for bear swings.',
    risk: 0.84,
    basePrice: 70,
    dividendYield: 0,
    volatility: 0.3
  }
];
