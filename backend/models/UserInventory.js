const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  cosmetics: { type: [String], default: [] }, // cosmetic item IDs
  resources: {
    coins: { type: Number, default: 0 },
    food: { type: Map, of: Number, default: {} },
    toys:  { type: Map, of: Number, default: {} }
  },
  shards: { type: Number, default: 0 },
  gachaPity: {
    type: Map,
    of: Number,
    default: {}
  },
  lastPassiveClaim: { type: Date, default: null },
  
});

module.exports = mongoose.model('UserInventory', UserInventorySchema);
