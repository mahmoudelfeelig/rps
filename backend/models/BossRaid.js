const mongoose = require('mongoose');

const raidContributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  damage: { type: Number, default: 0 },
  contributedAt: { type: Date, default: Date.now }
}, { _id: false });

const bossRaidSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bossKey: { type: String, required: true },
  maxHp: { type: Number, required: true },
  hp: { type: Number, required: true },
  rewardPool: { type: Number, default: 0 },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  defeated: { type: Boolean, default: false },
  contributions: [raidContributionSchema],
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('BossRaid', bossRaidSchema);
