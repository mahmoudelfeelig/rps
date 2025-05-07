const mongoose = require('mongoose');

const CritterSpeciesSchema = new mongoose.Schema({
  species: { type: String, unique: true },
  description: String,
  baseRarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical'] },
  foodPreferences: [String],
  playPreferences: [String],
  cosmeticsAvailable: [String],
  evolutions: [String],
  passiveTraitsByLevel: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('CritterSpecies', CritterSpeciesSchema);
