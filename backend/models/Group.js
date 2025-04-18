const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isApproved: { type: Boolean, default: false },
  rules: { type: String, default: "Default group rules" },
  economySettings: {
    startingBalance: { type: Number, default: 1000 },
    itemAvailability: { type: [String], default: [] },
  },  
  invites: [{ type: String }], // Array of emails or usernames
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
