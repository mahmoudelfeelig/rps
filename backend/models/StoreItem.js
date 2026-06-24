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
  maxStock: { type: Number },
  lastRestockedAt: { type: Date, default: Date.now },
  active:      { type: Boolean, default: true },
  consumable: { type: Boolean, default: true },          // badges are false
  effectType: {                                          // keep queries fast & explicit
    type: String,
    enum: [
      'extra-safe-click',     // mines
      'mine-reduction',       // mines
      'slots-luck',           // slots
      'reward-multiplier',    // global, see below
      'cosmetic',           // cosmetic items
    ],
    required: true
  },
  effectValue: {
  type: Number,
  required: true,
  validate: {
    validator: function (v) {
      switch (this.effectType) {
        case 'reward-multiplier':   return v > 1      && v <= 5;
        case 'extra-safe-click':    // fall‑through
        case 'mine-reduction':
        case 'slots-luck':          return Number.isInteger(v) && v > 0 && v <= 100;
        case 'cosmetic':            return v >= 0;
        default:                    return false;
      }
    },
    message: function (props) {
      return `Invalid effectValue ${props.value} for ${this.effectType}`;
    }
  }
},
  duration: { type: Number, default: 0 },                // seconds; 0 ⇒ until consumed
}, { timestamps: true });

module.exports = mongoose.model("StoreItem", storeItemSchema);
