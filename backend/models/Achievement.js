const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  criteria: {
    type:     String,
    enum:     [
      'betsPlaced','betsWon','storePurchases','logins','tasksCompleted',
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
  threshold: { type: Number, required: true },
  reward: { type: Number, required: true, default: 0 },
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Achievement", achievementSchema);
