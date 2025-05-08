const mongoose = require('mongoose');

const CosmeticItemSchema = new mongoose.Schema({
  _id: String, // like "wizard-hat"
  name: String,
  slot: { type: String, enum: ['hat', 'accessory', 'tail', 'body'] },
  price: { type: Number, default: 1_000 },
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Epic'] },
  unlockMethod: { type: String, enum: ['affection', 'event', 'shop'] },
  availableTo: [String] // species
});

module.exports = mongoose.model('CosmeticItem', CosmeticItemSchema);
