const Bet = require("../models/Bet");
const Group = require("../models/Group");
const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const { completeAchievement } = require('./achievementController');
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievement');
const User = require("../models/User");

// Create a bet
exports.createBet = async (req, res) => {
  try {
    console.log("Incoming bet creation:", req.body);

    const { title, description, groupId, options, endTime } = req.body;


    const bet = new Bet({
      title,
      description,
      group: groupId,
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


// Finalize result
exports.finalizeBet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { betId, result } = req.body;
    const userId = req.user.id;
    const now = new Date();

    const bet = await Bet.findById(betId).session(session);
    if (!bet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Bet not found" });
    }

    // Validate result option exists
    const validOption = bet.options.find(opt => opt.text === result);
    if (!validOption) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid result option" });
    }

    // Check permissions
    if (bet.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized to finalize this bet" });
    }

    // Check if bet can be finalized
    if (new Date(bet.endTime) > now && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bet cannot be finalized before end time" });
    }

    if (bet.result) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bet already finalized" });
    }

    // Update bet result
    bet.result = result;
    await bet.save({ session });

    // Process predictions
    const usersToUpdate = [...new Set(bet.predictions.map(p => p.user.toString()))];
    
    for (const userId of usersToUpdate) {
      const user = await User.findById(userId).session(session);
      if (!user) continue;

      // Remove from current bets
      user.currentBets = user.currentBets.filter(b => b.toString() !== betId);
      
      // Check if user won
      const userPredictions = bet.predictions.filter(p => p.user.toString() === userId);
      const won = userPredictions.some(p => p.choice === result);
      
      if (won) {
        user.betsWon += 1;
        // Calculate total winnings from all correct predictions
        const winnings = userPredictions
          .filter(p => p.choice === result)
          .reduce((sum, p) => sum + (p.amount * validOption.odds), 0);
        
        user.balance += winnings;
      }

      await user.save({ session });
      await checkAndAwardBadges(userId);
      await checkAndAwardAchievements(userId);
    }

    await session.commitTransaction();
    res.json({ message: "Bet finalized successfully", bet });

  } catch (error) {
    await session.abortTransaction();
    console.error("Finalize Bet Error:", error);
    res.status(500).json({ message: error.message || "Error finalizing bet" });
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
        groupId: pred.bet.group,
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
  
  
