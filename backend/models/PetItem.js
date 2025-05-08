const mongoose = require('mongoose');

const PetItemSchema = new mongoose.Schema({
  _id:        String,
  name:       String,
  type:       { type: String, enum: ['food','toy','pet','shard'], required: true },
  price:      { type: Number, required: true },
  currency:   { type: String, enum: ['coins', 'petCoins'], default: 'petCoins' },
  effect: {
    affectionBonus: { type: Number, default: 0 },
    expBonus:       { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('PetItem', PetItemSchema);
