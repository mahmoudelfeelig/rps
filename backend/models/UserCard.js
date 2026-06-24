const mongoose = require('mongoose');

const userCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardKey: { type: String, required: true },
  name: { type: String, required: true },
  tier: { type: String, required: true },
  rarity: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  power: { type: Number, default: 1 },
  styleSeed: String
}, { timestamps: true });

userCardSchema.index({ user: 1, cardKey: 1 }, { unique: true });

module.exports = mongoose.model('UserCard', userCardSchema);
