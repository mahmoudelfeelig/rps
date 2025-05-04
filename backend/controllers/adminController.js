const User = require('../models/User');
const Group = require('../models/Group');
const Bet = require('../models/Bet');
const Log = require('../models/Log');

// Update user/group status
exports.updateStatus = async (req, res) => {
  const { type, identifier } = req.params;
  const { status, reason } = req.body;

  try {
    let item;
    if (type === 'user') {
      item = await User.findOne({ username: identifier });
    } else if (type === 'group') {
      item = await Group.findById(identifier);
    }

    if (!item) {
      return res.status(404).json({ message: `${type} not found` });
    }

    item.status = status;
    if (reason) item.banReason = reason;
    await item.save();

    await Log.create({
      action: "Status Update",
      targetType: type.charAt(0).toUpperCase() + type.slice(1),
      targetId: item._id,
      admin: req.user._id,
      details: `${type} "${type === 'user' ? item.username : item.name}" status updated to ${status}`
    });

    res.json({ message: `${type} status updated`, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Modify user balance by username
exports.modifyBalance = async (req, res) => {
  const { username } = req.params;
  const { amount } = req.body;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid balance amount" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousBalance = user.balance;
    user.balance += amount;
    await user.save();

    await Log.create({
      action: "Balance Update",
      targetType: "User",
      targetId: user._id,
      admin: req.user._id,
      details: `Balance for ${username} updated from ${previousBalance} to ${user.balance} (Δ${amount})`
    });

    res.json({ 
      message: "Balance updated successfully",
      username,
      newBalance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set odds by bet title
exports.setOdds = async (req, res) => {
  const { title } = req.params;
  const { odds } = req.body;

  if (!odds || isNaN(odds)) {
    return res.status(400).json({ message: "Invalid odds value" });
  }

  try {
    const bet = await Bet.findOne({ title });
    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    const previousOdds = bet.odds;
    bet.odds = odds;
    await bet.save();

    await Log.create({
      action: "Odds Update",
      targetType: "Bet",
      targetId: bet._id,
      admin: req.user._id,
      details: `Odds for "${title}" updated from ${previousOdds} to ${odds}`
    });

    res.json({ 
      message: "Odds updated successfully",
      title,
      newOdds: bet.odds
    });
  } catch (err) {
    console.error("Error setting odds:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// View admin logs
exports.viewLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .populate("admin", "username")
      .populate({
        path: "targetId",
        select: "username email title description",
        model: { $cond: [ { $eq: ["$targetType", "User"] }, "User", "Bet" ] }
      });

    const formattedLogs = logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      admin: log.admin?.username || 'System',
      targetType: log.targetType,
      target: log.targetId?.username || log.targetId?.title || 'Unknown',
      details: log.details
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error" });
  }
};