const mongoose = require('mongoose');
const { Schema } = mongoose;
const RARITY_ORDER = ['Common','Uncommon','Rare','Legendary','Mythical'];

const CritterSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String, required: true },
  variant: { type: String },
  rarity:  { type: String, enum: RARITY_ORDER },
  affection: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  parents:[Schema.Types.ObjectId],
  generation: Number,    // auto‐increment when breeding
  evolvedTo: { type: String, default: null },
  traits:   { type: Schema.Types.Mixed, default: {} },
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
