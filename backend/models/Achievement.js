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
      'itemsOwned',
      'gamblingWon','gamblingLost',
      'marketTrades','dividendsClaimed',
      'portfolioPositions','portfolioQuantity',
      'prestigeLevel','balance'
    ],
    required: true,
    default:  'betsPlaced'
  },
  threshold: { type: Number, required: true, min: 1 },
  reward: { type: Number, required: true, default: 0, min: 0 },
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

achievementSchema.index({ criteria: 1, threshold: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
