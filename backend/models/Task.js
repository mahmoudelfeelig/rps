const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  emoji: { type: String, default: '' },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'bonus'],
    default: 'daily'
  },
  reward: {
    type: Number,
    default: 0,
    min: 0,
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
      'itemsOwned',
      'gamblingWon','gamblingLost',
      'marketTrades','dividendsClaimed',
      'portfolioPositions','portfolioQuantity',
      'prestigeLevel','balance'
    ],
    required: true,
    default:  'betsPlaced'
  },
  goalAmount: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  expiresAt: {
    type: Date,
    index: true
  },
  completedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

taskSchema.index({ type: 1, expiresAt: 1 });
taskSchema.index({ goalType: 1 });

module.exports = mongoose.model('Task', taskSchema);
