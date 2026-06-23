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
  lastDriftAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MarketAsset', marketAssetSchema);
