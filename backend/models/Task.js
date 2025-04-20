const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
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
    type: String,
    enum: ['betsPlaced', 'betsWon', 'storePurchases', 'logins'],
    required: true,
    default: 'betsPlaced'
  },
  goalAmount: {
    type: Number,
    required: true,
    default: 1
  },
  completedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Task', taskSchema);