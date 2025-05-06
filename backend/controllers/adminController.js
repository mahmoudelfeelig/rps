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

exports.getBetOptions = async (req, res) => {
  const { title } = req.params;
  try {
    const bet = await Bet.findOne({ title }).select('options').lean();
    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }
    return res.json({ options: bet.options });
  } catch (err) {
    console.error("Error in getBetOptions:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateOptionOdds = async (req, res) => {
  const { title, optionId } = req.params;
  const { odds } = req.body;

  if (odds == null || isNaN(odds)) {
    return res.status(400).json({ message: "Invalid odds value" });
  }

  try {
    const bet = await Bet.findOne({ title });
    if (!bet) return res.status(404).json({ message: "Bet not found" });

    const opt = bet.options.id(optionId);
    if (!opt) return res.status(404).json({ message: "Option not found" });

    const prev = opt.odds;
    opt.odds = Number(odds);
    await bet.save();

    await Log.create({
      action:     "Odds Update",
      targetType: "Bet",
      targetId:   bet._id,
      admin:      req.user._id,
      details:    `Bet "${title}" option "${opt.text}" odds ${prev}→${opt.odds}`
    });

    res.json({ message: "Option odds updated", optionId, newOdds: opt.odds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ status: { $ne: 'banned' } })
      .select("username balance status")
      .lean();
    res.json(users);
  } catch (err) {
    console.error("Error listing users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listBets = async (req, res) => {
  try {
    const bets = await Bet.find({ result: null })
      .select("title options")
      .lean();
    res.json(bets);
  } catch (err) {
    console.error("Error listing bets:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.viewLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .populate('admin', 'username')
      .lean();

    const formatted = await Promise.all(logs.map(async log => {
      let targetName = 'Unknown';
      if (log.targetType === 'User') {
        const u = await User.findById(log.targetId).select('username').lean();
        if (u) targetName = u.username;
      } else if (log.targetType === 'Bet') {
        const b = await Bet.findById(log.targetId).select('title').lean();
        if (b) targetName = b.title;
      }
      return {
        timestamp:  log.timestamp,
        action:     log.action,
        admin:      log.admin?.username || 'System',
        targetType: log.targetType,
        target:     targetName,
        details:    log.details
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error" });
  }
};
