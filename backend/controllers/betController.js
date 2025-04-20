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

    const { title, description, groupId, options } = req.body;


    const bet = new Bet({
      title,
      description,
      group: groupId,
      options,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),  // 1 day from now
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
    const { bets } = req.body; // [{ betId, choice }]

    let totalOdds = 1;
    const user = await User.findById(req.user.id);

    for (const { betId, choice } of bets) {
      const bet = await Bet.findById(betId);
      if (!bet || new Date() > new Date(bet.endTime)) continue;

      if (bet.predictions.find(p => p.user.toString() === req.user.id)) continue;

      const option = bet.options.find(o => o.text === choice);
      if (!option) continue;

      totalOdds *= option.odds;
      bet.predictions.push({ user: req.user.id, choice });
      await bet.save();

      if (!user.currentBets.includes(bet._id)) {
        user.currentBets.push(bet._id);
      }
    }

    user.betsPlaced += bets.length;
    await user.save();

    await checkAndAwardBadges(user._id);
    await checkAndAwardAchievements(user._id);

    res.json({ message: "Parlay bet placed", totalOdds });

  } catch (err) {
    console.error("Parlay Bet Error:", err);
    res.status(500).json({ message: "Error placing parlay bet" });
  }
};


// Finalize result
exports.finalizeBet = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const now = new Date();
    try {
      const { betId, result } = req.body;
      const userId = req.user.id;
  
      if (!isAdmin && now < new Date(bet.endTime)) {
        return res.status(403).json({ message: "Only admins can finalize early" });
      }

      const bet = await Bet.findById(betId);
      if (!bet) return res.status(404).json({ message: "Bet not found" });
  
      if (bet.createdBy.toString() !== userId)
        return res.status(403).json({ message: "Only the creator can finalize the bet" });
  
      if (!bet.options.includes(result))
        return res.status(400).json({ message: "Invalid result option" });
  
      if (bet.result) return res.status(400).json({ message: "Bet already finalized" });
  
      bet.result = result;
      await bet.save();

      // Get all predictions for this bet
      const usersToUpdate = bet.predictions.map(p => p.user.toString());

      for (const userId of usersToUpdate) {
        const user = await User.findById(userId);

        if (!user) continue;

        // Remove bet from currentBets
        user.currentBets = user.currentBets.filter(b => b.toString() !== bet._id.toString());

        // If they chose correctly, increment betsWon and possibly reward
        const pred = bet.predictions.find(p => p.user.toString() === userId);
        if (pred && pred.choice === result) {
          user.betsWon += 1;
          user.balance += 500;
        }
        await checkAndAwardBadges(userId);
        await checkAndAwardAchievements(userId);
        await user.save();
      }

      res.status(200).json({ message: "Bet finalized", bet });
    } catch (error) {
      console.error("Finalize Bet Error:", error);
      res.status(500).json({ message: "Error finalizing bet" });
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
  
  
