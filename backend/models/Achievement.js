const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  criteria: { type: String, required: true }, // e.g. 'complete_tasks', 'win_bets'
  threshold: { type: Number, required: true }, // e.g. 5, 10
  reward: { type: String, default: "💸" },
  earnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Achievement", achievementSchema);
