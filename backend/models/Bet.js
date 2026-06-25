const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  choice: { type: String, required: true },
  amount: { type: Number, default: 0, min: 0 },
});

const betSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  options: [
    {
      text: { type: String, required: true },
      odds: { type: Number, required: true, min: 1 },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
  ],  
  predictions: [predictionSchema],
  result: { type: String },
  endTime: { type: Date, required: true },
}, { timestamps: true });

betSchema.index({ result: 1, endTime: 1 });
betSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Bet", betSchema);
