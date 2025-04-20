const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },

  targetType: {
    type: String,
    enum: ["User", "Group", "Bet", "Task", "Achievement", "Item", "StoreItem"],
    required: false,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: "targetType",
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  details: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);
