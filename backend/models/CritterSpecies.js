const mongoose = require('mongoose');

const CritterSpeciesSchema = new mongoose.Schema({
  species: { type: String, unique: true },
  description: String,
  baseRarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical'] },
  foodPreferences: [String],
  playPreferences: [String],
  cosmeticsAvailable: [String],
  evolution: {
    nextSpecies: String,       // species name it evolves into
    levelReq:    Number,       // level or EXP threshold
    itemReq:     String        // optional item needed
  },
    passiveTraitsByLevel: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('CritterSpecies', CritterSpeciesSchema);
