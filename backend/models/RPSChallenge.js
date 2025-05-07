const mongoose = require('mongoose');

const rpsChallengeSchema = new mongoose.Schema({
  from:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyIn:     { type: Number, required: true },
  choice:    { type: String, enum: ['rock','paper','scissors'], required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});
// auto-expire invites after 5 minutes
rpsChallengeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('RPSChallenge', rpsChallengeSchema);