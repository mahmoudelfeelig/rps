const BASE_ASSETS = require('../config/marketAssets');
const { fetchAlphaDigitalCurrencies, fetchAlphaListingSymbols } = require('./marketData');

let cachedAssets = null;
let cachedAt = 0;

function numericHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stockAssetFromListing(listing, index) {
  const hash = numericHash(listing.symbol);
  const basePrice = 15 + (hash % 485);
  const risk = Number((0.22 + ((hash % 64) / 100)).toFixed(2));
  return {
    symbol: listing.symbol,
    name: listing.name,
    category: 'stock',
    description: `${listing.name} live Alpha Vantage listing${listing.exchange ? ` on ${listing.exchange}` : ''}.`,
    risk: Math.min(0.94, risk),
    basePrice,
    dividendYield: Number((((hash + index) % 28) / 1000).toFixed(3)),
    volatility: Number((0.035 + ((hash % 90) / 1000)).toFixed(3)),
    externalProvider: 'alphavantage',
    externalSymbol: listing.symbol
  };
}

function cryptoAssetFromListing(listing) {
  const hash = numericHash(listing.symbol);
  return {
    symbol: listing.symbol,
    name: listing.name,
    category: 'crypto',
    description: `${listing.name} crypto exposure priced from Alpha Vantage when available.`,
    risk: Number((0.72 + ((hash % 24) / 100)).toFixed(2)),
    basePrice: 25 + (hash % 375),
    dividendYield: 0,
    volatility: Number((0.14 + ((hash % 18) / 100)).toFixed(3)),
    externalProvider: 'alphavantage',
    externalSymbol: listing.symbol
  };
}

async function getMarketUniverse() {
  const ttlMs = Number(process.env.MARKET_UNIVERSE_CACHE_MS || 24 * 60 * 60 * 1000);
  if (cachedAssets && Date.now() - cachedAt < ttlMs) return cachedAssets;

  const stockLimit = Math.max(25, Math.min(1500, Number(process.env.MARKET_STOCK_LIMIT || 1000)));
  const cryptoLimit = Math.max(3, Math.min(250, Number(process.env.MARKET_CRYPTO_LIMIT || 100)));
  const [stocks, cryptos] = await Promise.all([
    fetchAlphaListingSymbols(stockLimit),
    fetchAlphaDigitalCurrencies(cryptoLimit)
  ]);

  const generated = [
    ...stocks.map(stockAssetFromListing),
    ...cryptos.map(cryptoAssetFromListing)
  ];
  const baseSymbols = new Set(BASE_ASSETS.map(asset => asset.symbol));
  cachedAssets = [
    ...BASE_ASSETS,
    ...generated.filter(asset => !baseSymbols.has(asset.symbol))
  ];
  cachedAt = Date.now();
  return cachedAssets;
}

module.exports = {
  getMarketUniverse
};
