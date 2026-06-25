const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  apr: { type: Number, default: 0.18, min: 0, max: 5 },
  lockedUntil: { type: Date, required: true },
  claimedAt: { type: Date, default: null },
  status: { type: String, enum: ['active', 'claimed'], default: 'active' }
}, { timestamps: true });

stakeSchema.index({ user: 1, status: 1, lockedUntil: 1 });
stakeSchema.index({ status: 1, lockedUntil: 1 });

module.exports = mongoose.model('Stake', stakeSchema);
