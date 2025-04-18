const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  choice: { type: String, required: true },
});

const betSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group"},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  options: [
    {
      text: String,
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
  ],  
  predictions: [predictionSchema],
  result: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Bet", betSchema);
