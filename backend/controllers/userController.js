const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id
    const updates = {}

    if (req.body.username) updates.username = req.body.username
    if (req.body.email) updates.email = req.body.email
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10)
    if (req.file) updates.image = `/uploads/${req.file.filename}`

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update user' })
  }
}
