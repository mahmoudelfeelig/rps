const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startingBalance: { type: Number, default: 1000 },
  rules: String,
  approved: { type: Boolean, default: false },
  requestedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Group", groupSchema);
