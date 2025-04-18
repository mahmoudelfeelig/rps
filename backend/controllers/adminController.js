const User = require('../models/User');
const Group = require('../models/Group');
const Bet = require('../models/Bet');
const Log = require('../models/Log');

// Change user or group status
exports.updateStatus = async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;
  try {
    let item = type === 'user' ? await User.findById(id) : await Group.findById(id);
    if (!item) return res.status(404).json({ message: `${type} not found` });
    item.status = status;
    await item.save();
    res.json({ message: `${type} status updated`, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Modify user balance
exports.modifyBalance = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.balance += amount;
    await user.save();
    res.json({ message: "Balance updated", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.setOdds = async (req, res) => {
    try {
      const { id } = req.params;
      const { odds } = req.body;
  
      if (!odds || isNaN(odds)) {
        return res.status(400).json({ message: "Invalid odds value" });
      }
  
      const bet = await Bet.findById(id);
      if (!bet) {
        return res.status(404).json({ message: "Bet not found" });
      }
  
      bet.odds = odds;
      await bet.save();
  
      await Log.create({
        action: "odds_updated",
        targetBet: bet._id,
        admin: req.user._id,
        details: `Odds set to ${odds}`,
      });
  
      res.json({ message: "Odds updated successfully" });
    } catch (err) {
      console.error("Error setting odds:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.viewLogs = async (req, res) => {
    try {
      const logs = await Log.find()
        .sort({ timestamp: -1 })
        .populate("admin", "username")
        .populate("targetUser", "username")
        .populate("targetGroup", "name")
        .populate("targetBet", "title");
  
      res.json(logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
