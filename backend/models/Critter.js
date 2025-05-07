const mongoose = require('mongoose');

const CritterSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String, required: true },
  variant: { type: String },
  affection: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  evolvedTo: { type: String, default: null },
  traits: [String],
  equippedCosmetics: {
    hat: String,
    accessory: String,
    body: String,
    tail: String,
  },
  adoptedAt: { type: Date, default: Date.now },
  lastFedAt: Date,
  lastPlayedAt: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Critter', CritterSchema);
