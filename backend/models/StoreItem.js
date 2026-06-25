const mongoose = require("mongoose");

const storeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['badge', 'power-up', 'cosmetic'], required: true },
  description: { type: String, default: '' },
  effect: { type: String, required: true },
  emoji: { type: String, default: '◆' },
  image: { type: String },
  price: { type: Number, required: true, min: 0 },
  stackable: { type: Boolean, default: false },
  stock: { type: Number, required: true, min: 0 },
  maxStock: { type: Number, min: 0 },
  lastRestockedAt: { type: Date, default: Date.now },
  active:      { type: Boolean, default: true },
  consumable: { type: Boolean, default: true },
  effectType: {
    type: String,
    enum: [
      'extra-safe-click',
      'mine-reduction',
      'slots-luck',
      'reward-multiplier',
      'cosmetic',
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
        case 'extra-safe-click':
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
  duration: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

storeItemSchema.index({ active: 1, type: 1, price: 1 });
storeItemSchema.index({ effectType: 1 });
storeItemSchema.index({ lastRestockedAt: 1 });

module.exports = mongoose.model("StoreItem", storeItemSchema);
