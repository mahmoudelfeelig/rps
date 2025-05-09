const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ── helper to build a random mine list ───────────────── */
function generateMines(rows, cols, mines) {
  const total   = rows * cols;
  const picks   = new Set();
  while (picks.size < mines) {
    picks.add(Math.floor(Math.random() * total));
  }
  return Array.from(picks);
}

/* ── schema ───────────────────────────────────────────── */
const minefieldSessionSchema = new Schema(
  {
    /* owner */
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    /* board parameters */
    rows:  { type: Number, required: true, min: 3 },
    cols:  { type: Number, required: true, min: 3 },
    mines: { type: [Number], required: true },            // list of indices
    extraSafeClicks: { type: Number, default: 0 },     // number of extra safe clicks

    /* progress */
    revealedCells: { type: [Number], default: [] },
    safeCount:     { type: Number,   default: 0 },

    /* wager */
    betAmount: { type: Number, default: 0 },

    /* flags */
    ended:     { type: Boolean, default: false },
    exploded:  { type: Boolean, default: false },
    cashedOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ── factory helper ───────────────────────────────────── */
minefieldSessionSchema.statics.createNew = function ({
  user,
  rows,
  cols,
  mines,
  betAmount,
  extraSafeClicks
}) {
  return this.create({
    user,
    rows,
    cols,
    mines: generateMines(rows, cols, mines),
    betAmount,
    extraSafeClicks
  });
};

module.exports = mongoose.model('MinefieldSession', minefieldSessionSchema);
