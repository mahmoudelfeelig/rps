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
  consumable: { type: Boolean, default: true },          // badges are false
  effectType: {                                          // keep queries fast & explicit
    type: String,
    enum: [
      'extra‑safe‑click',     // mines
      'mine‑reduction',       // mines
      'slots‑luck',           // slots
      'reward‑multiplier',    // global, see below
      'cosmetic',           // cosmetic items
    ],
    required: true
  },
  effectValue: { type: Number, required: true },         // e.g. 1 extra click, –3 mines, +10 % luck
  duration: { type: Number, default: 0 },                // seconds; 0 ⇒ until consumed
}, { timestamps: true });

module.exports = mongoose.model("StoreItem", storeItemSchema);