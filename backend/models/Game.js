const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: [
      'casino', 'spinner', 'minefield', 'mystery-box', 'gacha', 'click-frenzy', 'rps',
      'idle-ngu', 'market', 'puzzle-rush', 'daily-arcade', 'merge-lab', 'critters',
      'factory-tycoon', 'quiz-duel'
    ],
    required: true
  },
  unlockCriteria: {
    loginCount: { type: Number, default: 0, min: 0 },
    storePurchases: { type: Number, default: 0, min: 0 },
    tasksCompleted: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0, min: 0 },
    achievements: { type: Number, default: 0, min: 0 }
  }
}, { timestamps: true });

gameSchema.index({ type: 1 });

module.exports = mongoose.model('Game', gameSchema);
