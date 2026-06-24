const MarketAsset = require('../models/MarketAsset');
const User = require('../models/User');
const rewardMultiplier = require('../utils/rewardMultiplier');
const { fetchAlphaCryptoQuote, fetchAlphaQuote } = require('../utils/marketData');
const MARKET_ASSETS = require('../config/marketAssets');

const PRESTIGE_THRESHOLD = 250000;
const PRESTIGE_RESET_BALANCE = 1000;

function clampPrice(price) {
  return Math.max(5, Math.round(price));
}

function assetVolatility(asset) {
  return Math.max(0.02, Number(asset.volatility) || 0.1);
}

function performanceBias(asset) {
  if (asset.category !== 'rps-member') return 0;
  const games = Math.max(1, Number(asset.games) || 0);
  const winRate = (Number(asset.wins) || 0) / games;
  const streakBoost = Math.min(0.25, Math.abs(Number(asset.streak) || 0) * 0.02);
  return (winRate - 0.5) * 0.65 + streakBoost * Math.sign(asset.streak || 1);
}

function driftAsset(asset) {
  const volatility = assetVolatility(asset);
  const randomSwing = (Math.random() - 0.5) * volatility;
  const performance = performanceBias(asset);
  const categoryBias = asset.category === 'crypto'
    ? (Math.random() - 0.48) * 0.12
    : asset.category === 'option'
      ? (Math.random() - 0.5) * 0.18
      : 0.02;
  const multiplier = 1 + randomSwing + performance + categoryBias;
  asset.currentPrice = clampPrice((asset.currentPrice || asset.basePrice) * multiplier);
  asset.lastDriftAt = new Date();
  return asset;
}

async function ensureMarketSeed() {
  const configuredSymbols = MARKET_ASSETS.map(asset => asset.symbol);
  await Promise.all(MARKET_ASSETS.map(asset =>
    MarketAsset.updateOne(
      { symbol: asset.symbol },
      {
        $set: { ...asset, active: true },
        $setOnInsert: {
          currentPrice: asset.basePrice,
          lastDriftAt: new Date()
        }
      },
      { upsert: true }
    )
  ));
  await MarketAsset.updateMany(
    { symbol: { $nin: configuredSymbols }, active: { $ne: false } },
    { $set: { active: false } }
  );
}

function applyExternalQuote(asset, quote) {
  if (!quote?.price) return false;
  const base = Number(asset.basePrice) || 100;
  const external = Number(quote.price);
  const normalized = Math.max(0.2, Math.min(5, external / base));
  const change = Number(quote.change24h) || 0;
  const optionDirection = asset.symbol.includes('PUT') ? -1 : 1;
  const optionLeverage = asset.category === 'option' ? 2.5 : 1;

  if (asset.category === 'option') {
    asset.currentPrice = clampPrice(base * (1 + optionDirection * (change / 100) * optionLeverage));
  } else {
    asset.currentPrice = clampPrice(base * normalized);
  }
  asset.externalPrice = external;
  asset.externalChange24h = Number.isFinite(change) ? change : null;
  asset.externalUpdatedAt = quote.updatedAt || new Date();
  asset.lastDriftAt = new Date();
  return true;
}

async function refreshExternalPrices(assets) {
  for (const asset of assets) {
    if (asset.active === false) continue;

    let quote = null;
    if (asset.externalProvider === 'alphavantage') {
      quote = asset.category === 'crypto'
        ? await fetchAlphaCryptoQuote(asset.externalSymbol)
        : await fetchAlphaQuote(asset.externalSymbol);
    }

    if (applyExternalQuote(asset, quote)) {
      await asset.save();
    }
  }
}

async function refreshMarket(force = false) {
  await ensureMarketSeed();
  const assets = await MarketAsset.find({ active: { $ne: false } });
  const now = Date.now();

  const externalRefreshDue = force || assets.some(asset => (
    asset.externalProvider &&
    (!asset.externalUpdatedAt || now - new Date(asset.externalUpdatedAt).getTime() > 5 * 60 * 1000)
  ));
  if (externalRefreshDue) {
    await refreshExternalPrices(assets);
  }

  for (const asset of assets) {
    const elapsed = now - new Date(asset.lastDriftAt || 0).getTime();
    if (!asset.externalProvider && (force || elapsed > 30 * 60 * 1000)) {
      driftAsset(asset);
      await asset.save();
    }
  }

  return MarketAsset.find({ active: { $ne: false } }).lean();
}

function positionValue(position, price) {
  return Math.round((position.quantity || 0) * price);
}

async function getPortfolioSnapshot(user) {
  const assets = await MarketAsset.find({ active: { $ne: false } }).lean();
  const map = new Map(assets.map(asset => [asset.symbol, asset]));
  const portfolio = (user.portfolio || []).map(position => {
    const asset = map.get(position.symbol);
    if (!asset) return null;
    const currentValue = positionValue(position, asset.currentPrice);
    const costBasis = Math.round((position.quantity || 0) * (position.avgPrice || 0));
    return {
      ...position,
      name: asset.name,
      category: asset.category,
      currentPrice: asset.currentPrice,
      risk: asset.risk,
      dividendYield: asset.dividendYield,
      currentValue,
      gainLoss: currentValue - costBasis
    };
  }).filter(Boolean);

  const portfolioValue = portfolio.reduce((sum, pos) => sum + pos.currentValue, 0);
  return { portfolio, portfolioValue };
}

exports.getMarket = async (req, res) => {
  try {
    const assets = await refreshMarket();
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { portfolio, portfolioValue } = await getPortfolioSnapshot(user);

    res.json({
      assets,
      portfolio,
      portfolioValue,
      balance: user.balance || 0,
      prestigeLevel: user.prestigeLevel || 0,
      prestigeMultiplier: user.prestigeMultiplier || 1,
      threshold: PRESTIGE_THRESHOLD,
      canPrestige: (user.balance || 0) >= PRESTIGE_THRESHOLD
    });
  } catch (err) {
    console.error('getMarket error:', err);
    res.status(500).json({ message: 'Failed to load market' });
  }
};

exports.buyAsset = async (req, res) => {
  try {
    await ensureMarketSeed();
    const { symbol, quantity = 1 } = req.body;
    const amount = Math.max(1, parseInt(quantity, 10) || 1);
    const asset = await MarketAsset.findOne({ symbol, active: { $ne: false } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const cost = asset.currentPrice * amount;
    const debit = await User.updateOne(
      { _id: req.user.id, balance: { $gte: cost } },
      { $inc: { balance: -cost, marketTrades: 1 } }
    );
    if (debit.modifiedCount !== 1) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.portfolio = user.portfolio || [];
    const existing = user.portfolio.find(pos => pos.symbol === symbol);
    if (existing) {
      const totalQty = existing.quantity + amount;
      existing.avgPrice = ((existing.avgPrice * existing.quantity) + (asset.currentPrice * amount)) / totalQty;
      existing.quantity = totalQty;
      existing.dividendYield = asset.dividendYield;
      existing.lastDividendAt = existing.lastDividendAt || null;
    } else {
      user.portfolio.push({
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        quantity: amount,
        avgPrice: asset.currentPrice,
        dividendYield: asset.dividendYield,
        lastDividendAt: null
      });
    }

    asset.volume += amount;
    await Promise.all([user.save(), asset.save()]);

    const { portfolio, portfolioValue } = await getPortfolioSnapshot(user);
    res.json({
      balance: user.balance,
      portfolio,
      portfolioValue
    });
  } catch (err) {
    console.error('buyAsset error:', err);
    res.status(500).json({ message: 'Purchase failed' });
  }
};

exports.sellAsset = async (req, res) => {
  try {
    await ensureMarketSeed();
    const { symbol, quantity = 1 } = req.body;
    const amount = Math.max(1, parseInt(quantity, 10) || 1);
    const asset = await MarketAsset.findOne({ symbol, active: { $ne: false } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const user = await User.findOne({ _id: req.user.id, 'portfolio.symbol': symbol });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const position = (user.portfolio || []).find(pos => pos.symbol === symbol);
    if (!position || position.quantity < amount) {
      return res.status(400).json({ message: 'Not enough holdings' });
    }

    const payout = asset.currentPrice * amount;
    const sell = await User.updateOne(
      { _id: req.user.id, 'portfolio.symbol': symbol, 'portfolio.quantity': { $gte: amount } },
      {
        $inc: {
          balance: payout,
          marketTrades: 1,
          'portfolio.$.quantity': -amount
        }
      }
    );
    if (sell.modifiedCount !== 1) {
      return res.status(400).json({ message: 'Not enough holdings' });
    }
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { portfolio: { symbol, quantity: { $lte: 0 } } } }
    );
    asset.volume += amount;
    await asset.save();

    const updatedUser = await User.findById(req.user.id);

    const { portfolio, portfolioValue } = await getPortfolioSnapshot(updatedUser);
    res.json({
      balance: updatedUser.balance,
      payout,
      portfolio,
      portfolioValue
    });
  } catch (err) {
    console.error('sellAsset error:', err);
    res.status(500).json({ message: 'Sell failed' });
  }
};

exports.claimDividends = async (req, res) => {
  try {
    await ensureMarketSeed();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const assets = await MarketAsset.find({ active: { $ne: false } }).lean();
    const assetMap = new Map(assets.map(asset => [asset.symbol, asset]));
    const now = Date.now();
    let total = 0;

    user.portfolio = user.portfolio || [];
    for (const position of user.portfolio) {
      const asset = assetMap.get(position.symbol);
      if (!asset || !asset.dividendYield) continue;
      const last = new Date(position.lastDividendAt || 0).getTime();
      if (now - last < 24 * 60 * 60 * 1000) continue;

      const base = position.quantity * asset.currentPrice * asset.dividendYield;
      const payout = Math.max(0, Math.round(base * rewardMultiplier(user)));
      if (payout > 0) {
        total += payout;
        position.lastDividendAt = new Date();
      }
    }

    if (total > 0) {
      user.balance += total;
      user.dividendsClaimed = (user.dividendsClaimed || 0) + total;
      await user.save();
    }

    const { portfolio, portfolioValue } = await getPortfolioSnapshot(user);
    res.json({
      dividendTotal: total,
      balance: user.balance,
      portfolio,
      portfolioValue
    });
  } catch (err) {
    console.error('claimDividends error:', err);
    res.status(500).json({ message: 'Failed to claim dividends' });
  }
};

exports.prestige = async (req, res) => {
  try {
    await ensureMarketSeed();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if ((user.balance || 0) < PRESTIGE_THRESHOLD) {
      return res.status(400).json({ message: `Reach ${PRESTIGE_THRESHOLD.toLocaleString()} coins to prestige.` });
    }

    user.balance = PRESTIGE_RESET_BALANCE;
    user.portfolio = [];
    user.prestigeLevel = (user.prestigeLevel || 0) + 1;
    user.prestigeResets = (user.prestigeResets || 0) + 1;
    user.prestigeMultiplier = 1 + user.prestigeLevel * 0.15;
    user.lastPrestigeAt = new Date();
    await user.save();

    res.json({
      message: 'Prestige complete',
      balance: user.balance,
      prestigeLevel: user.prestigeLevel,
      prestigeMultiplier: user.prestigeMultiplier
    });
  } catch (err) {
    console.error('prestige error:', err);
    res.status(500).json({ message: 'Prestige failed' });
  }
};

exports.recordRpsMarketOutcome = async (botName, userWon) => {
  try {
    await ensureMarketSeed();
    const asset = await MarketAsset.findOne({ linkedTo: botName });
    if (!asset) return;

    asset.games += 1;
    if (userWon) {
      asset.wins += 1;
      asset.streak = asset.streak >= 0 ? asset.streak + 1 : 1;
    } else {
      asset.losses += 1;
      asset.streak = asset.streak <= 0 ? asset.streak - 1 : -1;
    }

    const trendBias = userWon ? -0.06 : 0.08;
    const streakBias = Math.max(-0.16, Math.min(0.16, asset.streak * 0.02));
    const volatility = assetVolatility(asset);
    const swing = (Math.random() - 0.5) * volatility;
    const multiplier = 1 + trendBias + streakBias + swing;
    asset.currentPrice = clampPrice(asset.currentPrice * multiplier);
    asset.lastDriftAt = new Date();
    await asset.save();
  } catch (err) {
    console.error('recordRpsMarketOutcome error:', err);
  }
};
