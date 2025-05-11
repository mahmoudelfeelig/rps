const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  profileImage: { type: String, default: '/default-avatar.png'},
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },

  // Public Profile
  publicProfileCreated: {
    type: Boolean,
    default: false
  },

  // Store
  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' },
    quantity: { type: Number, default: 1 }
  }],
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
  loginCount: { type: Number, default: 1 },
  lastLoginDate: { type: Date },
  storePurchases: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', default: [] }],

  // Badges
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  // Trading
  transactionHistory: [{
    type: { type: String, enum: ['send', 'receive', 'trade'] },
    amount: Number,
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  // Games
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
    nguRate: { type: Number, default: 1 }, // income per interval
    lastClickFrenzy: { type: Date }
  },

  // Games played/won
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

  // Gambling
  gamblingWon:         { type: Number, default: 0 },
  gamblingLost:        { type: Number, default: 0 },

  // RPS
  rpsHistory: [{
    opponent: String,
    buyIn: Number,
    yourPick: String,
    theirPick: String,
    outcome: { type: String, enum: ['win', 'lose', 'draw'] },
    playedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
