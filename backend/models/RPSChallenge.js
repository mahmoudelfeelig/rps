const mongoose = require('mongoose');

const rpsChallengeSchema = new mongoose.Schema({
  from:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyIn:     { type: Number, required: true, min: 1 },
  choice:    { type: String, enum: ['rock','paper','scissors'], required: true },
  createdAt: { type: Date, default: Date.now }
});
rpsChallengeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
rpsChallengeSchema.index({ to: 1, createdAt: -1 });
rpsChallengeSchema.index({ from: 1, createdAt: -1 });

module.exports = mongoose.model('RPSChallenge', rpsChallengeSchema);
