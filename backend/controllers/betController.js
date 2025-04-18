const Bet = require("../models/Bet");
const Group = require("../models/Group");
const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const { completeAchievement } = require('./achievementController');

// Create a bet
exports.createBet = async (req, res) => {
  try {
    console.log("Incoming bet creation:", req.body);

    const { title, description, groupId, options } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const bet = new Bet({
      title,
      description,
      group: groupId,
      options,
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
  
      const bet = await Bet.findById(betId);
      if (!bet) return res.status(404).json({ message: "Bet not found" });
  
      // ✅ Check if the bet is in a group the user belongs to
      const group = await Group.findById(bet.group);
      if (!group || !group.members.includes(req.user.id)) {
        return res.status(403).json({ message: "Not a member of the group" });
      }
  
      // ✅ Check if the selected option is valid
      if (!bet.options || !bet.options.includes(choice)) {
        return res.status(400).json({ message: "Invalid choice" });
      }
  
      // ✅ Check if prediction already exists
      const existing = await Prediction.findOne({ bet: betId, user: req.user.id });
      if (existing) {
        return res.status(400).json({ message: "Prediction already made" });
      }
  
      // ✅ Save prediction
      const prediction = new Prediction({
        bet: betId,
        user: req.user.id,
        choice,
      });
  
      await prediction.save();
      res.json({ message: "Prediction placed", prediction });
      const user = await User.findById(req.user.id);
      if (user.predictions.length === 1) {
        await completeAchievement(req.user.id, "First Bet");
    }
    } catch (err) {
      console.error("Place Bet Error:", err);
      res.status(500).json({ message: "Error placing prediction" });
    }
  };

// Finalize result
exports.finalizeBet = async (req, res) => {
    try {
      const { betId, result } = req.body;
      const userId = req.user.id;
  
      const bet = await Bet.findById(betId);
      if (!bet) return res.status(404).json({ message: "Bet not found" });
  
      if (bet.createdBy.toString() !== userId)
        return res.status(403).json({ message: "Only the creator can finalize the bet" });
  
      if (!bet.options.includes(result))
        return res.status(400).json({ message: "Invalid result option" });
  
      if (bet.result) return res.status(400).json({ message: "Bet already finalized" });
  
      bet.result = result;
      await bet.save();
  
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
  
