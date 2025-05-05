const mongoose = require("mongoose");

const storeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['badge', 'power-up', 'cosmetic'], required: true },
  description: { type: String, default: '' },
  effect: { type: String, required: true },
  emoji: { type: String, default: '📦' },
  image: { type: String },
  price: { type: Number, required: true },
  stackable: { type: Boolean, default: false },
  stock: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("StoreItem", storeItemSchema);