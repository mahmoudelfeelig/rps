const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  balance: {
    type: Number,
    default: 1000,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' }],
  purchaseHistory: [{
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
  purchasedAt: { type: Date, default: Date.now }
}],
loginCount: { type: Number, default: 0 },
lastLoginDate: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
