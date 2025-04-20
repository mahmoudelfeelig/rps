const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  resetToken: String,
  resetTokenExpiry: Date,
  profileImage: { type: String, default: null },

  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date,

  // Store
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' }],
  purchaseHistory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
    purchasedAt: { type: Date, default: Date.now }
  }],

  // Bets
  currentBets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet', default: [] }],
  betsPlaced: { type: Number, default: 0 },
  betsWon: { type: Number, default: 0 },

  // User engagement
  loginCount: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  storePurchases: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', default: [] }],

  // Badges
  badges: [{
    name: String,
    desc: String,
    earnedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
