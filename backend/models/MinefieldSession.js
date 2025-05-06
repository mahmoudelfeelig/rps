const mongoose = require('mongoose');
const { Schema } = mongoose;

const ROWS = 6;
const COLS = 6;
const MINES = 8;

// helper: randomly choose MINES distinct indices in [0 .. ROWS*COLS-1]
function generateMines() {
  const total = ROWS * COLS;
  const picks = new Set();
  while (picks.size < MINES) {
    picks.add(Math.floor(Math.random() * total));
  }
  return Array.from(picks);
}

const minefieldSessionSchema = new Schema({
  user:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mines:            { type: [Number],   default: () => generateMines() },
  revealedCells:    { type: [Number],   default: [] },
  safeCount:        { type: Number,     default: 0 },
  betAmount:        { type: Number,     default: 100 },
  ended:            { type: Boolean,    default: false },
  exploded:         { type: Boolean,    default: false },
  cashedOut:        { type: Boolean,    default: false },
}, { timestamps: true });

module.exports = mongoose.model('MinefieldSession', minefieldSessionSchema);
