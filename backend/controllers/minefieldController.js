const MinefieldSession = require('../models/MinefieldSession');
const User             = require('../models/User');
const rewardMultiplier = require('../utils/rewardMultiplier');
const { getUserBuffs, consumeOneShot } = require('../utils/applyEffects');

/* ───────── helpers ───────── */
function validateParameters(rows, cols, mines) {
  if (rows < 3 || cols < 3)    return 'Grid must be at least 3×3';
  const total = rows * cols;
  if (mines < 2)               return 'Need at least 2 mines';
  if (mines >= total)          return 'Too many mines for this grid';
  return null;
}

function oddsMultiplier(safeCount, mines, totalCells) {
  let mult           = 1;
  let remainingCells = totalCells;
  const remainingMines = mines;
  const dampening     = 0.6;

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
    let { betAmount, rows, cols, mines } = req.body;

    // 1) validate inputs
    if (rows == null || cols == null || mines == null) {
      return res.status(400).json({ message:'Must supply rows, cols, and mines' });
    }
    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ message:'Invalid bet amount' });
    }
    const paramError = validateParameters(rows, cols, mines);
    if (paramError) return res.status(400).json({ message:paramError });

    // 2) refund any unfinished round
    const prev = await MinefieldSession.findOne({ user:userId, ended:false });
    if (prev) {
      await MinefieldSession.updateOne(
        { _id:prev._id },
        { $set:{ ended:true, cashedOut:true } }
      );
      const refundUser = await User.findById(userId);
      refundUser.balance += prev.betAmount;
      await refundUser.save();
    }

    // 3) pull user & buffs BEFORE withdrawing
    const user = await User.findById(userId).populate('inventory.item');
    const buffs = getUserBuffs(user, ['extra-safe-click','mine-reduction']);
    const mineReduction   = buffs
      .filter(b => b.effectType === 'mine-reduction')
      .reduce((sum,b) => sum + b.effectValue, 0);
    const extraSafeClicks = buffs
      .filter(b => b.effectType === 'extra-safe-click')
      .reduce((sum,b) => sum + b.effectValue, 0);

    // adjust mine count (min 2)
    let finalMines = mines - mineReduction;
    const minExplodable = 2;
    if (finalMines < extraSafeClicks + minExplodable) {
      finalMines = extraSafeClicks + minExplodable;
    }

    // consume those one-shots
    await consumeOneShot(user, ['extra-safe-click','mine-reduction']);
    await user.save();

    // 4) ensure balance & withdraw bet
    if (user.balance < betAmount) {
      return res.status(400).json({ message:'Insufficient funds' });
    }
    user.balance -= betAmount;

    // 🔥 NEW: track minefield plays
    user.minefieldPlays = (user.minefieldPlays || 0) + 1;
    await user.save();

    // 5) create session with adjusted mines
    const session = await MinefieldSession.createNew({
      user:          userId,
      rows,
      cols,
      mines:         finalMines,
      betAmount,
      extraSafeClicks,
      originalMines: mines
    });

    return res.json({
      sessionId:      session._id,
      rows:           session.rows,
      cols:           session.cols,
      minesCount:     session.mines.length,
      extraSafeClicks,
      mineReduction,
      balance:        user.balance
    });
  } catch (err) {
    console.error('Minefield start error:', err);
    return res.status(500).json({ message:'Could not start minefield round' });
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

    // ─── hit a mine? ───────────────────────────
    if (session.mines.includes(cellIndex)) {
      if (session.extraSafeClicks > 0) {
        session.extraSafeClicks -= 1;
        await session.save();
      } else {
        session.ended    = true;
        session.exploded = true;
        await session.save();

        // track loss
        const loser = await User.findById(req.user.id);
        loser.gamblingLost = (loser.gamblingLost || 0) + session.betAmount;
        await loser.save();

        return res.json({ exploded: true, mines: session.mines });
      }
    }

    // ─── safe click ───────────────────────────
    session.safeCount += 1;
    await session.save();

    // 1) base reward from odds
    const mult       = oddsMultiplier(
      session.safeCount,
      session.originalMines,
      session.rows * session.cols
    );
    const baseReward = Math.floor(session.betAmount * mult);

    // 2) apply buff only to profit portion
    const user      = await User.findById(req.user.id).populate('inventory.item');
    const totalMult = rewardMultiplier(user);
    const profit    = Math.max(0, baseReward - session.betAmount);
    const bonus     = Math.round(profit * (totalMult - 1));
    const potentialReward = baseReward + bonus;

    return res.json({
      exploded:        false,
      safeCount:       session.safeCount,
      potentialReward,
      extraSafeClicks: session.extraSafeClicks
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

    // require at least one reveal
    if (session.safeCount === 0) {
      return res
        .status(400)
        .json({ message: 'You must reveal at least one cell before cashing out.' });
    }

    // compute base reward
    const mult       = oddsMultiplier(
      session.safeCount,
      session.originalMines,
      session.rows * session.cols
    );
    const baseReward = Math.floor(session.betAmount * mult);

    // apply buff only to profit
    const user      = await User.findById(req.user.id).populate('inventory.item');
    const profit    = baseReward - session.betAmount;
    const bonus     = Math.round(profit * (rewardMultiplier(user) - 1));
    const totalPayout = baseReward + bonus;

    // track win and net profit
    user.minefieldWins = (user.minefieldWins || 0) + 1;
    const net = totalPayout - session.betAmount;
    if (net >= 0) {
      user.gamblingWon = (user.gamblingWon || 0) + net;
    } else {
      user.gamblingLost = (user.gamblingLost || 0) + -net;
    }

    // consume any one-shot reward multiplier
    await consumeOneShot(user, ['reward-multiplier']);

    // credit user
    user.balance += totalPayout;
    await user.save();

    // finalize session
    session.ended     = true;
    session.cashedOut = true;
    await session.save();

    return res.json({ reward: totalPayout, balance: user.balance });
  } catch (err) {
    console.error('Cash out error:', err);
    return res.status(500).json({ message: 'Could not cash out' });
  }
};