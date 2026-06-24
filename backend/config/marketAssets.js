const MEMBER_TIERS = {
  S: ['safwat', 'effat', 'feel', 'sameh'],
  A: ['yehia', 'tofy', 'zabady', 'ceo', 'curls'],
  B: ['mohanad', 'hamed', 'aly', 'lepookie', 'nour'],
  C: ['surreal', 'othman', 'fam'],
  D: ['mindo', 'freeze', 'yaseen'],
  E: ['hassan', 'hatem', 'justice'],
  F: ['zaghloul', 'azab', 'zoair', 'khaled'],
  Z: ['fancy']
};

const TIER_PROFILE = {
  S: { basePrice: 520, risk: 0.26, dividendYield: 0.028, volatility: 0.05 },
  A: { basePrice: 410, risk: 0.34, dividendYield: 0.024, volatility: 0.07 },
  B: { basePrice: 310, risk: 0.44, dividendYield: 0.02, volatility: 0.09 },
  C: { basePrice: 230, risk: 0.54, dividendYield: 0.017, volatility: 0.12 },
  D: { basePrice: 170, risk: 0.66, dividendYield: 0.014, volatility: 0.15 },
  E: { basePrice: 125, risk: 0.76, dividendYield: 0.011, volatility: 0.18 },
  F: { basePrice: 90, risk: 0.86, dividendYield: 0.008, volatility: 0.22 },
  Z: { basePrice: 65, risk: 0.98, dividendYield: 0.004, volatility: 0.3 }
};

function symbolFor(name) {
  return name
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

const rpsMemberAssets = Object.entries(MEMBER_TIERS).flatMap(([tier, names]) =>
  names.map((name, index) => {
    const profile = TIER_PROFILE[tier];
    const variance = index * 7;
    return {
      symbol: `RPS-${symbolFor(name)}`,
      name,
      category: 'rps-member',
      description: `${tier}-tier member stock. Performance changes with game results and market flow.`,
      risk: Number(Math.min(0.99, profile.risk + index * 0.01).toFixed(2)),
      basePrice: profile.basePrice + variance,
      dividendYield: Number(Math.max(0.001, profile.dividendYield - index * 0.001).toFixed(3)),
      volatility: Number((profile.volatility + index * 0.006).toFixed(3)),
      linkedTo: name
    };
  })
);

module.exports = [
  ...rpsMemberAssets,
  {
    symbol: 'AAPL',
    name: 'Apple',
    category: 'stock',
    description: 'Large-cap tech stock mirrored into the game economy.',
    risk: 0.32,
    basePrice: 190,
    dividendYield: 0.006,
    volatility: 0.05,
    externalProvider: 'alphavantage',
    externalSymbol: 'AAPL'
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia',
    category: 'stock',
    description: 'High-growth semiconductor exposure with sharper swings.',
    risk: 0.58,
    basePrice: 145,
    dividendYield: 0.002,
    volatility: 0.1,
    externalProvider: 'alphavantage',
    externalSymbol: 'NVDA'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    category: 'stock',
    description: 'Volatile consumer-tech stock with strong momentum behavior.',
    risk: 0.68,
    basePrice: 240,
    dividendYield: 0,
    volatility: 0.13,
    externalProvider: 'alphavantage',
    externalSymbol: 'TSLA'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    description: 'Bitcoin price exposure converted into game currency movement.',
    risk: 0.88,
    basePrice: 320,
    dividendYield: 0,
    volatility: 0.22,
    externalProvider: 'alphavantage',
    externalSymbol: 'BTC'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    description: 'Ethereum price exposure converted into game currency movement.',
    risk: 0.78,
    basePrice: 260,
    dividendYield: 0,
    volatility: 0.18,
    externalProvider: 'alphavantage',
    externalSymbol: 'ETH'
  },
  {
    symbol: 'SPY-CALL',
    name: 'SPY Call Basket',
    category: 'option',
    description: 'Game-simulated call option exposure using SPY as the underlying reference.',
    risk: 0.96,
    basePrice: 75,
    dividendYield: 0,
    volatility: 0.34,
    externalProvider: 'alphavantage',
    externalSymbol: 'SPY'
  },
  {
    symbol: 'SPY-PUT',
    name: 'SPY Put Hedge',
    category: 'option',
    description: 'Game-simulated put option exposure using SPY as the underlying reference.',
    risk: 0.84,
    basePrice: 70,
    dividendYield: 0,
    volatility: 0.3,
    externalProvider: 'alphavantage',
    externalSymbol: 'SPY'
  }
];
