const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  unlockedGames: {
    type: [String],
    default: []
  },

  // Cooldowns for games that have time limits (e.g. daily)
  cooldowns: {
    spinner: { type: Date },
    clickFrenzy: { type: Date }

},

  nguUpgrades: {
    type: Number,
    default: 0
  },

  idleEarnings: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);
