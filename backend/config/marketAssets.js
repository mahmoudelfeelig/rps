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

const EXTERNAL_STOCKS = [
  ['AAPL', 'Apple', 190, 0.32, 0.006, 0.05],
  ['MSFT', 'Microsoft', 420, 0.28, 0.008, 0.045],
  ['NVDA', 'Nvidia', 145, 0.58, 0.002, 0.1],
  ['AMZN', 'Amazon', 190, 0.42, 0, 0.07],
  ['GOOGL', 'Alphabet', 175, 0.36, 0.004, 0.06],
  ['META', 'Meta', 500, 0.46, 0.004, 0.08],
  ['TSLA', 'Tesla', 240, 0.68, 0, 0.13],
  ['AMD', 'AMD', 160, 0.62, 0, 0.12],
  ['NFLX', 'Netflix', 650, 0.52, 0, 0.095],
  ['SPY', 'SPDR S&P 500 ETF', 545, 0.24, 0.012, 0.04],
  ['QQQ', 'Invesco QQQ ETF', 465, 0.34, 0.006, 0.055],
  ['IWM', 'Russell 2000 ETF', 210, 0.48, 0.01, 0.08],
  ['JPM', 'JPMorgan Chase', 205, 0.34, 0.018, 0.055],
  ['BAC', 'Bank of America', 40, 0.44, 0.022, 0.07],
  ['DIS', 'Disney', 105, 0.46, 0.006, 0.075],
  ['KO', 'Coca-Cola', 63, 0.18, 0.03, 0.025],
  ['MCD', "McDonald's", 285, 0.22, 0.025, 0.035],
  ['SHOP', 'Shopify', 75, 0.66, 0, 0.13],
  ['PLTR', 'Palantir', 25, 0.82, 0, 0.17],
  ['SOFI', 'SoFi', 8, 0.9, 0, 0.2],
  ['COIN', 'Coinbase', 230, 0.88, 0, 0.19],
  ['UBER', 'Uber', 72, 0.56, 0, 0.1],
  ['RBLX', 'Roblox', 38, 0.78, 0, 0.16],
  ['INTC', 'Intel', 31, 0.62, 0.012, 0.12],
  ['ORCL', 'Oracle', 140, 0.34, 0.012, 0.055]
];

const stockAssets = EXTERNAL_STOCKS.map(([symbol, name, basePrice, risk, dividendYield, volatility]) => ({
  symbol,
  name,
  category: 'stock',
  description: `${name} mirrored into the game economy through external market quotes when configured.`,
  risk,
  basePrice,
  dividendYield,
  volatility,
  externalProvider: 'alphavantage',
  externalSymbol: symbol
}));

const optionAssets = EXTERNAL_STOCKS.flatMap(([symbol, name, basePrice, risk]) => {
  const strikes = [0.9, 0.97, 1.03, 1.1];
  return strikes.flatMap(multiplier => {
    const strike = Math.round(basePrice * multiplier);
    return ['CALL', 'PUT'].map(type => ({
      symbol: `${symbol}-${type}-${strike}`,
      name: `${name} ${strike} ${type.toLowerCase()}`,
      category: 'option',
      description: `${type.toLowerCase()} option exposure on ${symbol}. Higher leverage, higher risk, game-currency only.`,
      risk: Number(Math.min(0.99, risk + 0.28 + Math.abs(1 - multiplier) * 0.8).toFixed(2)),
      basePrice: Math.max(12, Math.round(basePrice * (0.07 + Math.abs(1 - multiplier) * 0.25))),
      dividendYield: 0,
      volatility: Number(Math.min(0.45, 0.18 + risk * 0.2).toFixed(3)),
      externalProvider: 'alphavantage',
      externalSymbol: symbol
    }));
  });
});

const cryptoAssets = [
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
    symbol: 'SOL',
    name: 'Solana',
    category: 'crypto',
    description: 'Solana price exposure converted into game currency movement.',
    risk: 0.86,
    basePrice: 155,
    dividendYield: 0,
    volatility: 0.24,
    externalProvider: 'alphavantage',
    externalSymbol: 'SOL'
  }
];

module.exports = [
  ...rpsMemberAssets,
  ...stockAssets,
  ...cryptoAssets,
  ...optionAssets
];
