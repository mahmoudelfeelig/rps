const mongoose = require('mongoose');

const userCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardKey: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  tier: { type: String, enum: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'Z'], required: true },
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'anomaly'], required: true },
  level: { type: Number, default: 1, min: 1 },
  xp: { type: Number, default: 0, min: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  power: { type: Number, default: 1, min: 0 },
  styleSeed: { type: String, default: '' },
  image: { type: String, default: '' }
}, { timestamps: true });

userCardSchema.index({ user: 1, cardKey: 1 }, { unique: true });
userCardSchema.index({ tier: 1, rarity: 1 });

module.exports = mongoose.model('UserCard', userCardSchema);
