const mongoose = require('mongoose');

const economyEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['market', 'member-stock', 'boss-raid', 'league', 'sink'],
    required: true
  },
  description: { type: String, default: '' },
  modifier: { type: Number, default: 1, min: 0 },
  targetSymbol: { type: String, default: '' },
  targetTier: { type: String, default: '' },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

economyEventSchema.index({ active: 1, startsAt: 1, endsAt: 1 });
economyEventSchema.index({ type: 1, active: 1 });
economyEventSchema.index({ targetSymbol: 1 });
economyEventSchema.index({ targetTier: 1 });

module.exports = mongoose.model('EconomyEvent', economyEventSchema);
