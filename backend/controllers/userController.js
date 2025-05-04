const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const mongoose = require('mongoose');

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { username, email, password, currentPassword } = req.body;
    const updates = {};

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: 'Username already taken' });
      updates.username = username;
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

      updates.email = email;
      updates.emailVerified = false;

      const token = crypto.randomBytes(32).toString('hex');
      updates.emailVerificationToken = token;
      updates.emailVerificationTokenExpiry = Date.now() + 3600000;

      await sendVerificationEmail(email, token);
    }

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
      updates.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
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

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: 'Token is invalid or expired' });

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ balance: -1 })
      .select('username balance profileImage inventory achievements')
      .populate('inventory', 'name image')
      .populate('achievements', 'title icon')
      .lean();

    res.json(users);
  } catch (err) {
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
