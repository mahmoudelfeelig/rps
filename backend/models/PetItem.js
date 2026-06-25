const mongoose = require('mongoose');

const PetItemSchema = new mongoose.Schema({
  _id:        { type: String, required: true },
  name:       { type: String, required: true, trim: true },
  type:       { type: String, enum: ['food','toy','pet','shard'], required: true },
  price:      { type: Number, required: true, min: 0 },
  currency:   { type: String, enum: ['coins', 'petCoins'], default: 'petCoins' },
  effect: {
    affectionBonus: { type: Number, default: 0 },
    expBonus:       { type: Number, default: 0 }
  }
}, { timestamps: true });

PetItemSchema.index({ type: 1, price: 1 });
PetItemSchema.index({ currency: 1 });

module.exports = mongoose.model('PetItem', PetItemSchema);
