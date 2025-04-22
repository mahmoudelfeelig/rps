const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { username, email, password, currentPassword } = req.body;
    const updates = {};

    // Username uniqueness check
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updates.username = username;
    }

    // Email format + uniqueness check
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }

    // Password change: requires current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to change password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      updates.password = await bcrypt.hash(password, 10);
    }

    // Profile image (from multer)
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
  const { password } = req.body
  const user = await User.findById(req.user.id)
  const match = await bcrypt.compare(password, user.password)

  if (!match) return res.status(400).json({ message: 'Incorrect password' })

  await User.findByIdAndDelete(req.user.id)
  res.json({ message: 'Account deleted' })
}