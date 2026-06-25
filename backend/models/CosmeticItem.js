const mongoose = require('mongoose');

const CosmeticItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  slot: { type: String, enum: ['hat', 'accessory', 'tail', 'body'], required: true },
  price: { type: Number, default: 1_000, min: 0 },
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Epic'], default: 'Common' },
  unlockMethod: { type: String, enum: ['affection', 'event', 'shop'], default: 'shop' },
  availableTo: { type: [String], default: [] }
}, { timestamps: true });

CosmeticItemSchema.index({ slot: 1, rarity: 1 });
CosmeticItemSchema.index({ unlockMethod: 1 });

module.exports = mongoose.model('CosmeticItem', CosmeticItemSchema);
