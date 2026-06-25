const mongoose = require('mongoose');

const BetRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    market: { type: String, default: '' },
    oddsFormat: { type: String, enum: ['decimal', 'american', 'fractional'], default: 'decimal' },
    desiredOdds: { type: String, default: '' },
    stake: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

BetRequestSchema.index({ status: 1, createdAt: -1 });
BetRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BetRequest', BetRequestSchema);
