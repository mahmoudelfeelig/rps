const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  cosmetics: { type: [String], default: [] }, // cosmetic item IDs
  resources: {
    coins: { type: Number, default: 0 },
    food: { type: Map, of: Number }
  }
});

module.exports = mongoose.model('UserInventory', UserInventorySchema);
