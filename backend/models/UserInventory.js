const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cosmetics: { type: [String], default: [] },
  resources: {
    coins: { type: Number, default: 0, min: 0 },
    food: { type: Map, of: Number, default: {} },
    toys:  { type: Map, of: Number, default: {} }
  },
  shards: { type: Number, default: 0, min: 0 },
  gachaPity: {
    type: Map,
    of: Number,
    default: {}
  },
  lastPassiveClaim: { type: Date, default: null },
}, { timestamps: true });

UserInventorySchema.index({ lastPassiveClaim: 1 });

module.exports = mongoose.model('UserInventory', UserInventorySchema);
