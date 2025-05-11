const Bet = require("../models/Bet");
const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievements');
const User = require("../models/User");
const rewardMultiplier = require('../utils/rewardMultiplier');
const { getUserBuffs, consumeOneShot } = require('../utils/applyEffects');

// Create a bet
exports.createBet = async (req, res) => {
  try {
    const { title, description, options, endTime } = req.body;
    const bet = new Bet({
      title,
      description,
      options,
      endTime:  endTime,
      createdBy: req.user.id,
    });

    await bet.save();
    res.status(201).json({ message: "Bet created", bet });
  } catch (err) {
    console.error("Create Bet Error:", err);
    res.status(500).json({ message: "Error creating bet" });
  }
};

// Place a prediction
exports.placeBet = async (req, res) => {
  try {
    const { betId, choice } = req.body;
    // 1) Coerce stake to a number
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid positive number" });
    }

    // 2) Load bet & validate
    const bet = await Bet.findById(betId);
    if (!bet) return res.status(404).json({ message: "Bet not found" });
    if (Date.now() > new Date(bet.endTime)) {
      return res.status(400).json({ message: "Betting period has ended" });
    }
    const option = bet.options.find(o => o.text === choice);
    if (!option) return res.status(400).json({ message: "Invalid choice" });

    // 3) Load user & ensure funds
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 4) Deduct and record prediction
    user.balance -= amount;

    const existing = bet.predictions.find(
      p => p.user.toString() === user.id && p.choice === choice
    );
    if (existing) {
      existing.amount = Number(existing.amount) + amount;
    } else {
      bet.predictions.push({ user: user.id, choice, amount });
      option.votes.push(user.id);
    }

    // 5) Track current bets & stats
    if (!user.currentBets.includes(betId)) user.currentBets.push(betId);
    user.betsPlaced += 1;

    // 6) Save all
    await Promise.all([bet.save(), user.save()]);
    await checkAndAwardBadges(user.id);
    await checkAndAwardAchievements(user.id);

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

    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    let totalOdds = 1;
    const parlay = [];

    // 1) For each sub‐bet
    for (let { betId, choice } of bets) {
      const b = await Bet.findById(betId);
      if (!b || Date.now() > new Date(b.endTime)) {
        return res.status(400).json({ message: `Bet ${betId} invalid/expired.` });
      }
      if (b.predictions.some(p => p.user.toString() === user.id)) {
        return res.status(400).json({ message: `Already predicted on ${b.title}` });
      }
      const opt = b.options.find(o => o.text === choice);
      if (!opt) {
        return res.status(400).json({ message: `Invalid choice for ${b.title}` });
      }

      totalOdds *= Number(opt.odds);
      b.predictions.push({ user: user.id, choice, amount: 0 });
      opt.votes.push(user.id);
      await b.save();

      if (!user.currentBets.includes(betId)) user.currentBets.push(betId);
      parlay.push({ betId, choice });
    }

    // 2) Deduct & save parlay
    user.balance   -= amount;
    user.betsPlaced += bets.length;
    user.parlays    = user.parlays || [];
    user.parlays.push({
      bets:      parlay,
      amount,
      totalOdds,
      placedAt:  new Date(),
      won:       null
    });

    await user.save();
    await checkAndAwardBadges(user.id);
    await checkAndAwardAchievements(user.id);

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
    res.status(500).json({ message: "Error fetching bet" });
  }
};

exports.getByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const bet = await Bet.findOne({ title }).lean();
    if (!bet) return res.status(404).json({ message: 'Bet not found' });
    return res.json(bet);
  } catch (err) {
    console.error('Error fetching bet by title:', err);
    return res.status(500).json({ message: 'Error fetching bet' });
  }
};

exports.finalizeBet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { betId, optionId } = req.body;
    const adminId = req.user.id;
    const now     = new Date();

    // 1) Load bet under transaction
    const bet = await Bet.findById(betId).session(session);
    if (!bet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Bet not found" });
    }

    // 2) Prevent double‐finalization
    if (bet.result) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bet already finalized" });
    }

    // 3) Find and validate option
    const opt = bet.options.id(optionId);
    if (!opt) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Option not found" });
    }

    // 4) Permission & timing checks
    if (bet.createdBy.toString() !== adminId && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized to finalize this bet" });
    }
    if (new Date(bet.endTime) > now && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot finalize before end time" });
    }

    // 5) Finalize the bet
    const resultText = opt.text;
    bet.result = resultText;
    await bet.save({ session });

    // 6) Payout winners
    const winners = [...new Set(bet.predictions.map(p => p.user.toString()))];
    for (const uid of winners) {
      // Load user under session (unpopulated)
      const userDoc = await User.findById(uid).session(session);
      if (!userDoc) continue;

      // Remove from currentBets
      userDoc.currentBets = userDoc.currentBets.filter(b => b.toString() !== betId);

      // Determine if they won
      const theirPreds = bet.predictions.filter(p => p.user.toString() === uid);
      const won = theirPreds.some(p => p.choice === resultText);

      if (won) {
        userDoc.betsWon += 1;

        // 1) Total stake on winning option
        const totalStake = theirPreds
          .filter(p => p.choice === resultText)
          .reduce((sum, p) => sum + p.amount, 0);

        // 2) Base profit
        const profit = totalStake * (opt.odds - 1);

        // 3) Load populated user for multiplier & consume badge
        const fullUser = await User.findById(uid)
          .populate('inventory.item')
          .session(session);

        const boosted = Math.round(profit * rewardMultiplier(fullUser));
        await consumeOneShot(fullUser, ['reward-multiplier'], session);

        // 4) Final payout = stake returned + boosted profit
        fullUser.balance += totalStake + boosted;
        await fullUser.save({ session });
      } else {
        // On a draw or loss, just save any changes (refunds handled elsewhere)
        await userDoc.save({ session });
      }

      // Award badges & achievements after payout
      await checkAndAwardBadges(uid);
      await checkAndAwardAchievements(uid);
    }

    await session.commitTransaction();
    return res.json({ message: "Bet finalized successfully", bet });
  } catch (err) {
    await session.abortTransaction();
    console.error("Finalize Bet Error:", err);
    return res.status(500).json({ message: err.message || "Error finalizing bet" });
  } finally {
    session.endSession();
  }
};


  
// Get a user's bet history
exports.getBetHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const predictions = await Prediction.find({ user: userId }).populate("bet");
    const history = predictions.map(pred => ({
      betId: pred.bet._id,
      title: pred.bet.title,
      description: pred.bet.description,
      prediction: pred.choice,
      result: pred.bet.result || null,
      isCorrect: pred.bet.result ? pred.choice === pred.bet.result : null,
    }));

    res.status(200).json({ history });
  } catch (error) {
    console.error("Get History Error:", error);
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

    res.status(200).json(bets);
  } catch (error) {
    console.error("Get Active Bets Error:", error);
    res.status(500).json({ message: "Error retrieving active bets" });
  }
};


