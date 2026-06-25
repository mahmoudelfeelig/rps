const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bet: { type: mongoose.Schema.Types.ObjectId, ref: "Bet", required: true },
    choice: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ bet: 1, user: 1 });

module.exports = mongoose.model("Prediction", predictionSchema);
