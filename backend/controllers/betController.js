const Bet = require("../models/Bet");
const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievements');
const User = require("../models/User");
const rewardMultiplier = require('../utils/rewardMultiplier');
const { consumeOneShot } = require('../utils/applyEffects');

exports.createBet = async (req, res) => {
  try {
    const { title, description, options, endTime } = req.body;
    const bet = new Bet({
      title,
      description,
      options,
      endTime,
      createdBy: req.user.id,
    });
    await bet.save();
    res.status(201).json({ message: "Bet created", bet });
  } catch (err) {
    console.error("Create Bet Error:", err);
    res.status(500).json({ message: "Error creating bet" });
  }
};

exports.placeBet = async (req, res) => {
  try {
    const { betId, choice } = req.body;
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid positive number" });
    }

    const bet = await Bet.findById(betId);
    if (!bet) return res.status(404).json({ message: "Bet not found" });
    if (Date.now() > new Date(bet.endTime)) {
      return res.status(400).json({ message: "Betting period has ended" });
    }
    const option = bet.options.find(o => o.text === choice);
    if (!option) return res.status(400).json({ message: "Invalid choice" });

    const debit = await User.updateOne(
      { _id: req.user.id, balance: { $gte: amount } },
      {
        $inc: { balance: -amount, gamblingLost: amount, betsPlaced: 1 },
        $addToSet: { currentBets: betId }
      }
    );
    if (debit.modifiedCount !== 1) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const existing = bet.predictions.find(
      p => p.user.toString() === req.user.id && p.choice === choice
    );
    if (existing) {
      existing.amount += amount;
    } else {
      bet.predictions.push({ user: req.user.id, choice, amount });
      option.votes.push(req.user.id);
    }

    try {
      await bet.save();
    } catch (saveErr) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { balance: amount, gamblingLost: -amount, betsPlaced: -1 }
      });
      throw saveErr;
    }
    await checkAndAwardBadges(req.user.id);
    await checkAndAwardAchievements(req.user.id);

    res.json({ message: "Prediction placed", bet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error placing prediction" });
  }
};

exports.placeParlayBet = async (req, res) => {
  try {
    const { bets } = req.body;
    const amount = Number(req.body.amount);
    if (!Array.isArray(bets) || bets.length < 2) {
      return res.status(400).json({ message: "Parlay must include at least 2 bets." });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid parlay amount." });
    }

    let totalOdds = 1;
    const parlay = [];
    const betDocs = [];

    for (let { betId, choice } of bets) {
      const b = await Bet.findById(betId);
      if (!b || Date.now() > new Date(b.endTime)) {
        return res.status(400).json({ message: `Bet ${betId} invalid/expired.` });
      }
      if (b.predictions.some(p => p.user.toString() === req.user.id)) {
        return res.status(400).json({ message: `Already predicted on ${b.title}` });
      }
      const opt = b.options.find(o => o.text === choice);
      if (!opt) {
        return res.status(400).json({ message: `Invalid choice for ${b.title}` });
      }

      totalOdds *= Number(opt.odds);
      betDocs.push({ b, opt, betId, choice });
      parlay.push({ betId, choice });
    }

    const debit = await User.updateOne(
      { _id: req.user.id, balance: { $gte: amount } },
      { $inc: { balance: -amount, gamblingLost: amount, betsPlaced: bets.length } }
    );
    if (debit.modifiedCount !== 1) return res.status(400).json({ message: "Insufficient balance" });

    try {
      for (const { b, opt, choice } of betDocs) {
      b.predictions.push({ user: req.user.id, choice, amount: 0 });
      opt.votes.push(req.user.id);
      await b.save();
      }
    } catch (saveErr) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { balance: amount, gamblingLost: -amount, betsPlaced: -bets.length } });
      throw saveErr;
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { currentBets: { $each: parlay.map(p => p.betId) } },
      $push: {
        parlays: {
          bets:      parlay,
          amount,
          totalOdds,
          placedAt:  new Date(),
          won:       null
        }
      }
    });
    await checkAndAwardBadges(req.user.id);
    await checkAndAwardAchievements(req.user.id);

    res.json({ message: "Parlay placed", totalOdds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error placing parlay bet" });
  }
};

exports.getSingleBet = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('predictions.user', 'username');
    if (!bet) return res.status(404).json({ message: "Bet not found" });
    res.json(bet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bet" });
  }
};

exports.getByTitle = async (req, res) => {
  try {
    const bet = await Bet.findOne({ title: req.params.title }).lean();
    if (!bet) return res.status(404).json({ message: "Bet not found" });
    res.json(bet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bet" });
  }
};

exports.finalizeBet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { betId, optionId } = req.body;
    const adminId = req.user.id;
    const now = new Date();

    const bet = await Bet.findById(betId).session(session);
    if (!bet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Bet not found" });
    }
    if (bet.result) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bet already finalized" });
    }

    const opt = bet.options.id(optionId);
    if (!opt) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Option not found" });
    }

    if (bet.createdBy.toString() !== adminId && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (new Date(bet.endTime) > now && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot finalize before end time" });
    }

    bet.result = opt.text;
    await bet.save({ session });

    const users = [...new Set(bet.predictions.map(p => p.user.toString()))];
    for (let uid of users) {
      const userDoc = await User.findById(uid).session(session);
      if (!userDoc) continue;

      userDoc.currentBets = userDoc.currentBets.filter(b => b.toString() !== betId);

      const preds = bet.predictions.filter(p => p.user.toString() === uid);
      const won = preds.some(p => p.choice === bet.result);
      if (won) {
        userDoc.betsWon += 1;

        const totalStake = preds
          .filter(p => p.choice === bet.result)
          .reduce((s,p) => s + p.amount, 0);
        const profit = totalStake * (opt.odds - 1);

        const fullUser = await User.findById(uid)
          .populate('inventory.item')
          .session(session);
        const boosted = Math.round(profit * rewardMultiplier(fullUser));
        await consumeOneShot(fullUser, ['reward-multiplier'], session);

        fullUser.gamblingWon = (fullUser.gamblingWon || 0) + boosted;

        fullUser.balance += totalStake + boosted;
        await fullUser.save({ session });
      } else {
        await userDoc.save({ session });
      }

      await checkAndAwardBadges(uid);
      await checkAndAwardAchievements(uid);
    }

    await session.commitTransaction();
    res.json({ message: "Bet finalized", bet });
  } catch (err) {
    await session.abortTransaction();
    console.error("FinalizeBet Error:", err);
    res.status(500).json({ message: "Error finalizing bet" });
  } finally {
    session.endSession();
  }
};

exports.getBetHistory = async (req, res) => {
  try {
    const preds = await Prediction.find({ user: req.user.id }).populate("bet");
    const history = preds.map(p => ({
      betId:      p.bet._id,
      title:      p.bet.title,
      description:p.bet.description,
      prediction: p.choice,
      result:     p.bet.result || null,
      isCorrect:  p.bet.result ? p.choice === p.bet.result : null,
    }));
    res.json({ history });
  } catch (err) {
    console.error("GetBetHistory Error:", err);
    res.status(500).json({ message: "Error retrieving history" });
  }
};

exports.getActiveBets = async (req, res) => {
  try {
    const now = new Date();
    const bets = await Bet.find({
      endTime: { $gt: now },
      result: null
    }).sort({ endTime: 1 });
    res.json(bets);
  } catch (err) {
    console.error("GetActiveBets Error:", err);
    res.status(500).json({ message: "Error retrieving active bets" });
  }
};
