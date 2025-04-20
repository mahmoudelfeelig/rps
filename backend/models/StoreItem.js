const mongoose = require("mongoose");

const storeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['badge', 'power-up', 'cosmetic'], required: true },
  effect: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("StoreItem", storeItemSchema);