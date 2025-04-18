const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: String,
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  targetBet: { type: mongoose.Schema.Types.ObjectId, ref: "Bet" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  details: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
