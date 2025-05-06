const MinefieldSession = require('../models/MinefieldSession');
const User              = require('../models/User');

const ROWS     = 6;
const COLS     = 6;
const MINES    = 8;

// POST /api/games/minefield/start
exports.startRound = async (req, res) => {
    try {
      const userId    = req.user.id;
      const { betAmount } = req.body;
  
      if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ message: 'Invalid bet amount' });
      }
  
      // 1) Refund any unfinished round
      const prev = await MinefieldSession.findOne({ user: userId, ended: false });
      if (prev) {
        prev.ended     = true;
        prev.cashedOut = true;
        await prev.save();
  
        const u = await User.findById(userId);
        u.balance += prev.betAmount;
        await u.save();
      }
  
      // 2) Debit this new bet
      const user = await User.findById(userId);
      if (user.balance < betAmount) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      user.balance -= betAmount;
      await user.save();
      const updatedBalance = user.balance;  // capture for the response
  
      // 3) Create the session (no `mines: undefined`!)
      const session = await MinefieldSession.create({
        user:      userId,
        betAmount,             // dynamic
        // don't pass `mines`, so Mongoose default kicks in
      });
  
      return res.json({
        sessionId:  session._id,
        rows:       ROWS,
        cols:       COLS,
        betAmount:  session.betAmount,
        revealed:   session.revealedCells,
        minesCount: session.mines.length,
        balance:    updatedBalance   // <<< send the new balance
      });
    } catch (err) {
      console.error('Minefield start error:', err);
      return res.status(500).json({ message: 'Could not start minefield round' });
    }
  };

// Reveal a cell (POST /api/games/minefield/reveal)
exports.revealCell = async (req, res) => {
    const { sessionId, cellIndex } = req.body;
    try {
      const session = await MinefieldSession.findById(sessionId);
      if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.ended) {
        return res.status(400).json({ message: 'Round already ended' });
      }
      if (session.revealedCells.includes(cellIndex)) {
        return res.status(400).json({ message: 'Cell already revealed' });
      }
  
      session.revealedCells.push(cellIndex);
  
      // hit a mine → you lose your bet (no refund)
      if (session.mines.includes(cellIndex)) {
        session.ended    = true;
        session.exploded = true;
        await session.save();
        return res.json({ exploded: true, mines: session.mines });
      }
  
      // safe click → bump safeCount and return new potential reward
      session.safeCount += 1;
      await session.save();
      const multiplier = 1 + session.safeCount * 0.2; // 20% per safe click
      return res.json({
        exploded:        false,
        safeCount:       session.safeCount,
        potentialReward: Math.floor(session.betAmount * multiplier),
      });
    } catch (err) {
      console.error('Reveal cell error:', err);
      res.status(500).json({ message: 'Could not reveal cell' });
    }
  };

// POST /api/games/minefield/cashout
exports.cashOut = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = await MinefieldSession.findById(sessionId);
      if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.ended) {
        return res.status(400).json({ message: 'Round already ended' });
      }
  
      // compute payout
      const multiplier = 1 + session.safeCount * 0.2; // 20% per safe click
      const reward     = Math.floor(session.betAmount * multiplier);
  
      // credit user
      const user = await User.findById(req.user.id);
      user.balance += reward;
      await user.save();
      const updatedBalance = user.balance;
  
      // close session
      session.ended     = true;
      session.cashedOut = true;
      await session.save();
  
      return res.json({
        reward,
        balance: updatedBalance   // <<< send the new balance
      });
    } catch (err) {
      console.error('Cash out error:', err);
      return res.status(500).json({ message: 'Could not cash out' });
    }
  };