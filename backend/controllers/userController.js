const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

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

      await sendVerificationEmail(email, token); // assumes this helper is implemented
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
