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
    default: [
      'casino','spinner','minefield','mystery-box',
      'gacha','click-frenzy','rps','idle-ngu',
      'puzzle-rush','merge-lab','critters','factory-tycoon','quiz-duel'
    ]
  },

  cooldowns: {
    spinner:      { type: Date },
    spinner12:    { type: Date },
    spinnerDaily: { type: Date },
    spinnerWeekly:{ type: Date }
  },
  
  frenzyTotal:        { type: Number, default: 0 },
  frenzyResetAt:      { type: Date,   default: null },
  nguUpgrades:        { type: Number, default: 0 },
  idleEarnings:       { type: Number, default: 0 },
  rpsWins:            { type: Number, default: 0 },
  rpsGames:           { type: Number, default: 0 },
  puzzleRushTotal:    { type: Number, default: 0 },
  puzzleRushSolved:  { type: [String], default: [] },
  puzzleRushResetAt:  { type: Date,   default: null }
}, { timestamps: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);




