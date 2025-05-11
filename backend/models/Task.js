const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  emoji: String,
  type: {
    type: String,
    enum: ['daily', 'weekly', 'bonus'],
    default: 'daily'
  },
  reward: {
    type: Number,
    default: 0,
  },
  goalType: {
    type:     String,
    enum:     [
      'betsPlaced','betsWon','storePurchases','logins',
      'tasksCompleted',
      'minefieldPlays','minefieldWins',
      'puzzleSolves',
      'clickFrenzyClicks',
      'casinoPlays','casinoWins',
      'rpsPlays','rpsWins',
      'slotsPlays','slotsWins',
      'itemsOwned'
    ],
    required: true,
    default:  'betsPlaced'
  },
  goalAmount: {
    type: Number,
    required: true,
    default: 1
  },
  expiresAt: {
    type: Date,
    index: true            // TTL index
  },
  completedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Task', taskSchema);