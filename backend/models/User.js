const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBot: { type: Boolean, default: false, index: true },
  botProfile: {
    archetype: String,
    risk: { type: Number, default: 0.5 },
    activity: { type: Number, default: 0.5 },
    spending: { type: Number, default: 0.5 },
    lastSimulatedAt: { type: Date, default: null }
  },
  balance: { type: Number, default: 0 },
  profileImage: { type: String, default: '/assets/avatars/default-avatar.png'},
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  prestigeLevel: { type: Number, default: 0 },
  prestigeResets: { type: Number, default: 0 },
  prestigeMultiplier: { type: Number, default: 1 },
  lastPrestigeAt: { type: Date, default: null },

  publicProfileCreated: {
    type: Boolean,
    default: false
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, default: null, select: false },
  emailVerificationToken: { type: String, default: null, select: false },
  emailVerificationExpiresAt: { type: Date, default: null },

  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
    quantity: { type: Number, default: 1 }
  }],
    purchaseHistory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
    purchasedAt: { type: Date, default: Date.now }
  }],

  currentBets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet', default: [] }],
  betsPlaced: { type: Number, default: 0 },
  betsWon: { type: Number, default: 0 },

  parlays: [
    {
      bets: [{ betId: mongoose.Schema.Types.ObjectId, choice: String }],
      amount: Number,
      totalOdds: Number,
      placedAt: Date,
      won: { type: Boolean, default: null } // null = unresolved, true = won, false = lost
    }
  ],
  
  loginCount: { type: Number, default: 1 },
  lastLoginDate: { type: Date },
  storePurchases: { type: Number, default: 0 },
  marketTrades: { type: Number, default: 0 },
  dividendsClaimed: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', default: [] }],

  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  transactionHistory: [{
    type: { type: String, enum: ['send', 'receive', 'trade'] },
    amount: Number,
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  portfolio: [{
    symbol: String,
    name: String,
    category: { type: String, enum: ['stock', 'crypto', 'option', 'rps-member'] },
    quantity: { type: Number, default: 0 },
    avgPrice: { type: Number, default: 0 },
    dividendYield: { type: Number, default: 0 },
    lastDividendAt: { type: Date, default: null },
    acquiredAt: { type: Date, default: Date.now }
  }],

  games: {
    unlocked: [{
      type: String,
      enum: [
        'casino','spinner','minefield','mystery-box','gacha','click-frenzy','rps','idle-ngu',
        'puzzle-rush','merge-lab','virtual-pet','factory-tycoon','quiz-duel'
      ]
    }],
    lastSpinDate: { type: Date },
    nguLevel: { type: Number, default: 1 },
    nguRate: { type: Number, default: 1 },
    lastClickFrenzy: { type: Date }
  },

  minefieldPlays:      { type: Number, default: 0 },
  minefieldWins:       { type: Number, default: 0 },
  puzzleSolves:        { type: Number, default: 0 },
  clickFrenzyClicks:   { type: Number, default: 0 },
  casinoPlays:         { type: Number, default: 0 },
  casinoWins:          { type: Number, default: 0 },
  rpsPlays:            { type: Number, default: 0 },
  rpsWins:             { type: Number, default: 0 },
  slotsPlays:          { type: Number, default: 0 },
  slotsWins:           { type: Number, default: 0 },

  gamblingWon:         { type: Number, default: 0 },
  gamblingLost:        { type: Number, default: 0 },

  rpsHistory: [{
    opponent: String,
    opponentType: { type: String, enum: ['user', 'bot'], default: 'user' },
    opponentMood: String,
    buyIn: Number,
    yourPick: String,
    theirPick: String,
    outcome: { type: String, enum: ['win', 'lose', 'draw'] },
    playedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
