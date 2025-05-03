const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievement');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const isSameDay = (d1, d2) => {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = Date.now() + 3600000;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpiry,
      profileImage: '/default-avatar.png',
      publicProfileCreated: true,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${emailVerificationToken}`;
    await sendVerificationEmail(email, 'Verify your email', `Click to verify: ${verifyUrl}`);

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const now = new Date();
    const lastLogin = new Date(user.lastLoginDate || 0);

    if (!isSameDay(now, lastLogin)) {
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginDate = now;
      await user.save();
    }

    if (!user.publicProfileCreated) {
      user.publicProfileCreated = true;
      if (!user.profileImage) {
        user.profileImage = '/default-avatar.png';
      }
      await user.save();
    }

    await checkAndAwardBadges(user._id);
    await checkAndAwardAchievements(user._id);

    const token = generateToken(user._id);

    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendVerificationEmail(email, 'Reset your password', `Reset here: ${resetUrl}`);

    res.json({ message: 'Password reset link sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending reset link' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
