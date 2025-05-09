const MinefieldSession = require('../models/MinefieldSession');
const User             = require('../models/User');

/* ───────── helpers ───────── */
function validateParameters(rows, cols, mines) {
  if (rows < 3 || cols < 3)           return 'Grid must be at least 3×3';
  const total = rows * cols;
  if (mines < 2)                      return 'Need at least 2 mines';
  if (mines >= total)                 return 'Too many mines for this grid';
  return null;
}

/**
 * trueOdds  = remainingCells / safeCells
 * effectiveOdds = 1 + dampening * (trueOdds - 1)
 * total multiplier = product of effectiveOdds over each safe click
 */
function rewardMultiplier(safeCount, mines, totalCells) {
  let mult           = 1;
  let remainingCells = totalCells;
  const remainingMines = mines;

  // 0 = no extra reward, 1 = full true odds
  const dampening = 0.6;

  for (let i = 0; i < safeCount; i++) {
    const safeCells = remainingCells - remainingMines;
    if (safeCells <= 0) break;

    const trueOdds = remainingCells / safeCells;
    const effOdds  = 1 + dampening * (trueOdds - 1);

    mult *= effOdds;
    remainingCells -= 1;
  }

  return mult;
}

/* ───────── POST /api/games/minefield/start ───────── */
exports.startRound = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount, rows, cols, mines } = req.body;

    if (rows == null || cols == null || mines == null) {
      return res
        .status(400)
        .json({ message: 'Must supply rows, cols, and mines in request body' });
    }
    /* 1. validate inputs */
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: 'Invalid bet amount' });

    const paramError = validateParameters(rows, cols, mines);
    if (paramError) return res.status(400).json({ message: paramError });

    /* 2. abort unfinished round (refund) */
    const prev = await MinefieldSession.findOne({ user: userId, ended: false });
    if (prev) {
      // mark it ended/cashedOut WITHOUT re-validating the old doc
      await MinefieldSession.updateOne(
        { _id: prev._id },
        { $set: { ended: true, cashedOut: true } }
      );

      const refundUser = await User.findById(userId);
      refundUser.balance += prev.betAmount;
      await refundUser.save();
    }

    /* 3. ensure balance */
    const user = await User.findById(userId);
    if (user.balance < betAmount)
      return res.status(400).json({ message: 'Insufficient funds' });

    user.balance -= betAmount;
    await user.save();

    /* 4. create new session */
    const session = await MinefieldSession.createNew({
      user: userId,
      rows,
      cols,
      mines,
      betAmount,
    });
    if (!rows || !cols) throw new Error(`Missing grid dimensions: rows=${rows}, cols=${cols}`);

    return res.json({
      sessionId: session._id,
      rows: session.rows,
      cols: session.cols,
      minesCount: session.mines.length,
      balance: user.balance,
    });
  } catch (err) {
    console.error('Minefield start error:', err);
    return res.status(500).json({ message: 'Could not start minefield round' });
  }
};

/* ───────── POST /api/games/minefield/reveal ───────── */
exports.revealCell = async (req, res) => {
  const { sessionId, cellIndex } = req.body;

  try {
    const session = await MinefieldSession.findById(sessionId);
    if (!session || session.user.toString() !== req.user.id)
      return res.status(404).json({ message: 'Session not found' });
    if (session.ended)
      return res.status(400).json({ message: 'Round already ended' });
    if (session.revealedCells.includes(cellIndex))
      return res.status(400).json({ message: 'Cell already revealed' });

    session.revealedCells.push(cellIndex);

    /* hit a mine? */
    if (session.mines.includes(cellIndex)) {
      session.ended    = true;
      session.exploded = true;
      await session.save();
      return res.json({ exploded: true, mines: session.mines });
    }

    /* safe click */
    session.safeCount += 1;
    await session.save();

    const mult = rewardMultiplier(
      session.safeCount,
      session.mines.length,
      session.rows * session.cols
    );

    return res.json({
      exploded:        false,
      safeCount:       session.safeCount,
      potentialReward: Math.floor(session.betAmount * mult),
    });
  } catch (err) {
    console.error('Reveal cell error:', err);
    return res.status(500).json({ message: 'Could not reveal cell' });
  }
};

/* ───────── POST /api/games/minefield/cashout ───────── */
exports.cashOut = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await MinefieldSession.findById(sessionId);
    if (!session || session.user.toString() !== req.user.id)
      return res.status(404).json({ message: 'Session not found' });
    if (session.ended)
      return res.status(400).json({ message: 'Round already ended' });

    const mult = rewardMultiplier(
      session.safeCount,
      session.mines.length,
      session.rows * session.cols
    );
    const reward = Math.floor(session.betAmount * mult);

    const user = await User.findById(req.user.id);
    user.balance += reward;
    await user.save();

    session.ended     = true;
    session.cashedOut = true;
    await session.save();

    return res.json({ reward, balance: user.balance });
  } catch (err) {
    console.error('Cash out error:', err);
    return res.status(500).json({ message: 'Could not cash out' });
  }
};
