const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  resetToken: String,
  resetTokenExpiry: Date,
  profileImage: { type: String, default: '/default-avatar.png' },

  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date,

  // Profile
  publicUsername: { type: String, unique: true }, // for mini profiles

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

  // Parlay bets
  parlays: [
    {
      bets: [{ betId: mongoose.Schema.Types.ObjectId, choice: String }],
      amount: Number,
      totalOdds: Number,
      placedAt: Date,
      won: { type: Boolean, default: null } // null = unresolved, true = won, false = lost
    }
  ],
  
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
