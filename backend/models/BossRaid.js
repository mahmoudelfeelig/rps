const mongoose = require('mongoose');

const raidContributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  damage: { type: Number, default: 0, min: 0 },
  contributedAt: { type: Date, default: Date.now }
}, { _id: false });

const bossRaidSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bossKey: { type: String, required: true },
  maxHp: { type: Number, required: true, min: 1 },
  hp: { type: Number, required: true, min: 0 },
  rewardPool: { type: Number, default: 0, min: 0 },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  defeated: { type: Boolean, default: false },
  contributions: [raidContributionSchema],
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

bossRaidSchema.index({ active: 1, endsAt: 1 });
bossRaidSchema.index({ bossKey: 1, active: 1 });

module.exports = mongoose.model('BossRaid', bossRaidSchema);
