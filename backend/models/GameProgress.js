const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // List of games the user has unlocked
  unlockedGames: {
    type: [String], // e.g., ['spinner', 'casino', 'frenzy']
    default: []
  },

  // Cooldowns for games that have time limits (e.g. daily)
  cooldowns: {
    spinner: { type: Date },
    clickFrenzy: { type: Date }
    // Add more cooldowns as needed
  },

  // Idle NGU progression
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
