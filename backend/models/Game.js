const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  type: { type: String, enum: ['casino', 'spinner', 'minefield', 'mystery-box', 'gacha', 'click-frenzy', 'rps', 'idle-ngu'], required: true },
  unlockCriteria: {
    loginCount: { type: Number, default: 0 },
    storePurchases: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    achievements: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Game', gameSchema);
