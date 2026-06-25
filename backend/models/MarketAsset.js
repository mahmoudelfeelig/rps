const mongoose = require('mongoose');

const marketAssetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['stock', 'crypto', 'option', 'rps-member'],
    required: true
  },
  description: { type: String, default: '' },
  linkedTo: { type: String, default: '' },
  externalSymbol: { type: String, default: '' },
  externalProvider: { type: String, enum: ['', 'alphavantage'], default: '' },
  externalId: { type: String, default: '' },
  externalPrice: { type: Number, default: null },
  externalChange24h: { type: Number, default: null },
  externalUpdatedAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  risk: { type: Number, default: 0.5 },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  dividendYield: { type: Number, default: 0 },
  volatility: { type: Number, default: 0.1 },
  volume: { type: Number, default: 0 },
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  priceHistory: [{
    price: Number,
    externalPrice: { type: Number, default: null },
    change24h: { type: Number, default: null },
    recordedAt: { type: Date, default: Date.now }
  }],
  lastDriftAt: { type: Date, default: Date.now }
}, { timestamps: true });

marketAssetSchema.index({ category: 1, active: 1, symbol: 1 });
marketAssetSchema.index({ externalProvider: 1, externalSymbol: 1 });
marketAssetSchema.index({ linkedTo: 1 });
marketAssetSchema.index({ lastDriftAt: 1 });

module.exports = mongoose.model('MarketAsset', marketAssetSchema);
