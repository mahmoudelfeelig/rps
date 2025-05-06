const mongoose = require('mongoose');
const { Schema } = mongoose;

// New grid size and mine count
const ROWS  = 8;
const COLS  = 8;
const MINES = 10;

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
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mines:         { type: [Number], default: () => generateMines() },
  revealedCells: { type: [Number], default: [] },
  safeCount:     { type: Number,   default: 0 },
  betAmount:     { type: Number,   default: 100 },
  ended:         { type: Boolean,  default: false },
  exploded:      { type: Boolean,  default: false },
  cashedOut:     { type: Boolean,  default: false },
}, { timestamps: true });

module.exports = mongoose.model('MinefieldSession', minefieldSessionSchema);
