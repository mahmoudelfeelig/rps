const User = require('../models/User');
const UserInventory = require('../models/UserInventory');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements= require('../utils/checkAndAwardAchievements');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('username balance profileImage');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const inv = await UserInventory.findOneAndUpdate(
      { userId: req.user.id },
      {},
      { upsert: true, new: true }
    );

    const now = Date.now();
    const last = inv.lastPassiveClaim?.getTime() || 0;
    const nextClaim = last + 15 * 60 * 1000; // 15 min cooldown

    res.json({
      username: user.username,
      balance: user.balance,
      profileImage: user.profileImage,
      resources: {
        coins:  inv.resources.coins,
        food:   Object.fromEntries(inv.resources.food),
        toys:   Object.fromEntries(inv.resources.toys),
        shards: inv.shards,
        nextClaim: Math.max(0, nextClaim - now)
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user info.' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { username, password } = req.body;
    const updates = {};

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: 'Username already taken' });
      updates.username = username;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    // multer-cloudinary puts the public URL into req.file.path
    if (req.file && req.file.path) {
      updates.profileImage = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id);
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Incorrect password' });

  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'Account deleted' });
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ balance: -1 })
      .select('username balance profileImage inventory achievements')
      .populate({
        path: 'inventory',
        populate: {
          path: 'item',
          model: 'StoreItem',
          select: 'name emoji image' 
        }
      })
      .populate('achievements', 'title icon')
      .lean();

    const out = users.map(u => ({
      ...u,
      inventory: (u.inventory || []).map(({ item, quantity }) => ({ item, quantity }))
    }));

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

exports.sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { recipientUsername, amount } = req.body;
    const senderId = req.user.id;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const sender = await User.findById(senderId).session(session);
    const recipient = await User.findOne({ username: recipientUsername }).session(session);

    if (!recipient) return res.status(404).json({ message: 'User not found' });
    if (sender.balance < numericAmount) return res.status(400).json({ message: 'Insufficient funds' });

    // Update balances
    sender.balance -= numericAmount;
    recipient.balance += Math.floor(.95*numericAmount); // 5% fee :3

    // Add transaction history
    sender.transactionHistory.push({
      type: 'send',
      amount: numericAmount,
      to: recipient._id
    });

    recipient.transactionHistory.push({
      type: 'receive',
      amount: numericAmount,
      from: sender._id
    });

    await sender.save({ session });
    await recipient.save({ session });
    await session.commitTransaction();
    
    res.json({ newBalance: sender.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Transfer failed' });
  } finally {
    session.endSession();
  }
};

exports.getStats = async (req, res) => {
  try {
    await checkAndAwardBadges(req.user.id);
    await checkAndAwardAchievements(req.user.id);

    const user = await User.findById(req.user.id)
      .populate('badges')
      .populate('achievements')
      .populate('role')
      .populate({
        path: 'inventory',
        populate: {
          path: 'item',
          model: 'StoreItem',
          select: 'name type emoji image description price effect effectType effectValue consumable'
        }
      })
      .populate({
        path: 'currentBets',
        select: 'title options predictions result'
      })
      .populate('username')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const inventory = (user.inventory || []).map(({ item, quantity }) => ({ item, quantity })).filter(entry => entry.item);

    const stats = {
      username:            user.username,
      betsPlaced:          user.betsPlaced,
      betsWon:             user.betsWon,
      storePurchases:      user.storePurchases,
      logins:              user.loginCount,
      role:                user.role,
      tasksCompleted:      user.tasksCompleted,
      balance:             user.balance,
      claimedAchievements: user.achievements   || [],
      badges:              user.badges         || [],
      currentBets:         user.currentBets    || [],
      profileImage:     user.profileImage,
      inventory
    };

    res.json({ userId: req.user.id, ...stats });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('username balance profileImage badges achievements inventory')
      .populate({
        path: 'inventory',
        populate: {
          path: 'item',
          model: 'StoreItem',
          select: 'name type emoji image description price'
        }
      })
      .populate('achievements')
      .populate('badges')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const inventory = (user.inventory || []).map(({ item, quantity }) => ({ item, quantity }));
    const badges = (user.badges || []).filter(b => typeof b === 'object');

    res.json({
      username:     user.username,
      balance:      user.balance,
      profileImage: user.profileImage,
      achievements: user.achievements,
      badges,
      inventory
    });
  } catch (err) {
    console.error('Error in getPublicProfile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};