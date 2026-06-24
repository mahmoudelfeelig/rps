const mongoose = require('mongoose');

const economyEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['market', 'member-stock', 'boss-raid', 'league', 'sink'],
    required: true
  },
  description: { type: String, default: '' },
  modifier: { type: Number, default: 1 },
  targetSymbol: { type: String, default: '' },
  targetTier: { type: String, default: '' },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('EconomyEvent', economyEventSchema);
