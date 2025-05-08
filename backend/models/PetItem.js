const mongoose = require('mongoose');

const PetItemSchema = new mongoose.Schema({
  _id:        String,                        // e.g. "premium-food", "squeaky-toy"
  name:       String,
  type:       { type: String, enum: ['food','toy'], required: true },
  price:      { type: Number, required: true },
  effect: {
    affectionBonus: { type: Number, default: 0 },
    expBonus:       { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('PetItem', PetItemSchema);
