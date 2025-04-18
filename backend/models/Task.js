const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
  reward: { type: Number, default: 100 },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
