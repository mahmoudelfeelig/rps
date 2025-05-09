const Bet = require("../models/Bet");
const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievements');
const User = require("../models/User");
const rewardMultiplier = require('../utils/rewardMultiplier');

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
    const { betId, choice, amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });

    const bet = await Bet.findById(betId);
    if (!bet) return res.status(404).json({ message: "Bet not found" });

    if (new Date() > new Date(bet.endTime)) {
      return res.status(400).json({ message: "Betting period has ended" });
    }

    const option = bet.options.find(o => o.text === choice);
    if (!option) return res.status(400).json({ message: "Invalid choice" });

    const user = await User.findById(userId);
    if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    // Deduct balance immediately
    user.balance -= amount;

    // Check if prediction already exists for same bet AND choice
    let existingPrediction = bet.predictions.find(
      p => p.user.toString() === userId && p.choice === choice
    );

    if (existingPrediction) {
      // Increase amount
      existingPrediction.amount = (existingPrediction.amount || 0) + amount;
    } else {
      // New prediction
      bet.predictions.push({ user: userId, choice, amount });

      // Add vote to the option
      if (!option.votes.includes(userId)) {
        option.votes.push(userId);
      }
    }

    // Add to user's current bets
    if (!user.currentBets.includes(betId)) {
      user.currentBets.push(betId);
    }

    user.betsPlaced += 1;

    await bet.save();
    await user.save();

    await checkAndAwardBadges(userId);
    await checkAndAwardAchievements(userId);

    
    res.json({ message: "Prediction placed", bet });

  } catch (err) {
    console.error("Place Bet Error:", err);
    res.status(500).json({ message: "Error placing prediction" });
  }
};



exports.placeParlayBet = async (req, res) => {
  try {
    const { bets, amount } = req.body; // [{ betId, choice }], amount = total parlay wager
    const userId = req.user.id;

    if (!Array.isArray(bets) || bets.length < 2) {
      return res.status(400).json({ message: "Parlay must include at least 2 bets." });
    }

    if (amount <= 0) return res.status(400).json({ message: "Invalid parlay amount." });

    const user = await User.findById(userId);
    if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    let totalOdds = 1;
    const parlay = [];

    for (const { betId, choice } of bets) {
      const bet = await Bet.findById(betId);
      if (!bet || new Date(bet.endTime) < new Date()) {
        return res.status(400).json({ message: `Bet ${betId} is invalid or expired.` });
      }

      if (bet.predictions.find(p => p.user.toString() === userId)) {
        return res.status(400).json({ message: `Already predicted on bet ${bet.title}` });
      }

      const option = bet.options.find(o => o.text === choice);
      if (!option) {
        return res.status(400).json({ message: `Invalid choice for bet ${bet.title}` });
      }

      totalOdds *= option.odds;

      bet.predictions.push({ user: userId, choice, amount: 0 }); // Amount 0 to indicate it's from parlay
      if (!option.votes.includes(userId)) option.votes.push(userId);
      await bet.save();

      if (!user.currentBets.includes(bet._id)) user.currentBets.push(bet._id);

      parlay.push({ betId: bet._id, choice });
    }

    user.balance -= amount;
    user.betsPlaced += bets.length;

    if (!user.parlays) user.parlays = [];
    user.parlays.push({
      bets: parlay,
      amount,
      totalOdds,
      placedAt: new Date(),
      won: null, // Will be filled in when all bets resolve
    });

    await user.save();
    await checkAndAwardBadges(userId);
    await checkAndAwardAchievements(userId);


    res.json({ message: "Parlay placed", totalOdds });

  } catch (err) {
    console.error("Parlay Bet Error:", err);
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
    const now = new Date();

    // 1) Load the bet under transaction
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

    // 3) Find the chosen option
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
      const user = await User.findById(uid).session(session);
      if (!user) continue;

      // remove from currentBets
      user.currentBets = user.currentBets.filter(b => b.toString() !== betId);

      // did they pick the winning option?
      const theirPreds = bet.predictions.filter(p => p.user.toString() === uid);
      const won = theirPreds.some(p => p.choice === resultText);

      if (won) {
        user.betsWon += 1;
        // 1) total stake the user placed on the winning option
        const totalStake = theirPreds
          .filter(p => p.choice === resultText)
          .reduce((sum, p) => sum + p.amount, 0);

        // 2) base profit (stake × (odds‑1))
        const profit   = totalStake * (opt.odds - 1);

        // 3) apply reward‑multiplier **only to the profit**
        const boosted = Math.round(profit * rewardMultiplier(user));

        // 4) final coins = stake returned + boosted profit
        user.balance += totalStake + boosted;
      }

      await user.save({ session });
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
  
  
