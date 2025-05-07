const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  id:       { type: String, required: true },
  type:     { type: String, required: true },
  question: { type: mongoose.Schema.Types.Mixed, required: true },
  solution: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const dailyPuzzleSchema = new mongoose.Schema({
  date:    { type: String, required: true, unique: true },  // YYYY-MM-DD
  puzzles: { type: [puzzleSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('DailyPuzzle', dailyPuzzleSchema);