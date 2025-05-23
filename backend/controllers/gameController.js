const GameProgress = require('../models/GameProgress');
const User         = require('../models/User');
const DailyPuzzle  = require('../models/DailyPuzzle');
const RPSChallenge = require('../models/RPSChallenge');
const {
  generateMatch3,
  generateSliding,
  generateMemory,
  generateLogicGrid,
  generateNQueens
} = require('../utils/puzzleGenerator');

const MAX_FRENZY_PER_HOUR = 100;
const ICON_REWARDS = {
  '🐭':  5,
  '🦉': 10,
  '🐧':  7,
  '🦋': 12,
  '🐞': 15
};
const rewardMultiplier = require('../utils/rewardMultiplier');
const { getUserBuffs, consumeOneShot } = require('../utils/applyEffects');

/**
 * GET /api/games/progress
 */
exports.getProgress = async (req, res) => {
  try {
    let prog = await GameProgress.findOne({ user: req.user.id }).lean();
    if (!prog) {
      prog = await GameProgress.create({ user: req.user.id });
      prog = prog.toObject();
    }

    const spinnerConfigs = {
      spinner: {
        rewardOptions: [0, 10, 20, 30, 50, 75, 100, 150, 200],
        weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
      },
      spinner12: {
        rewardOptions: [0, 50, 100, 150, 250, 400, 600, 900, 1200],
        weights:       [15, 25, 30, 15, 10, 4, 1, 0.5, 0.5]
      },
      spinnerDaily: {
        rewardOptions: [0, 200, 400, 600, 1000, 1500, 2000, 3000, 4000],
        weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
      },
      spinnerWeekly: {
        rewardOptions: [0, 500, 1000, 1500, 2500, 4000, 6000, 8000, 10000],
        weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
      }
    };

    return res.json({
      unlockedGames: prog.unlockedGames,
      cooldowns: {
        spinner:       prog.cooldowns.spinner?.toISOString()    || null,
        spinner12:     prog.cooldowns.spinner12?.toISOString()  || null,
        spinnerDaily:  prog.cooldowns.spinnerDaily?.toISOString()|| null,
        spinnerWeekly: prog.cooldowns.spinnerWeekly?.toISOString()|| null,
        clickFrenzy:   prog.cooldowns.clickFrenzy?.toISOString() || null
      },
      spinners:     spinnerConfigs,
      rpsStats: {
        wins:  prog.rpsWins  || 0,
        games: prog.rpsGames || 0
      },
      puzzleStats: {
        wins:    prog.puzzleRushTotal   || 0,
        resetAt: prog.puzzleRushResetAt?.toISOString() || null
      },
      gambling: {
        won:    prog.gamblingWon || 0,
        lost:   prog.gamblingLost || 0,
      },
      plays: {
        minefield:    (req.user.minefieldPlays    || 0),
        spinner:      (req.user.spinnerPlays       || 0),
        clickFrenzy:  (req.user.clickFrenzyPlays   || 0),
        casino:       (req.user.casinoPlays        || 0),
        roulette:     (req.user.roulettePlays      || 0),
        coinFlip:     (req.user.coinFlipPlays      || 0),
        slots:        (req.user.slotsPlays         || 0),
        rps:          (req.user.rpsPlays           || 0),
        puzzleRush:   (prog.puzzleRushTotal       || 0),
      }
    });
  } catch (err) {
    console.error('Error fetching game progress:', err);
    return res.status(500).json({ message: 'Failed to load progress' });
  }
};

/**
 * Generic helper to spin a wheel with its own cooldown & rewards.
 */
async function spinTiered(req, res, opts) {
  const { cooldownField, cooldownMs, rewardOptions, weights } = opts;
  try {
    const userId = req.user.id;
    const prog   = await GameProgress.findOne({ user: userId });
    if (!prog) return res.status(404).json({ message: 'Game progress not found' });

    const now      = new Date();
    const nextSpin = prog.cooldowns[cooldownField];
    if (nextSpin && now < nextSpin) {
      return res.status(429).json({ message: 'Come back later!' });
    }

    // weighted random
    const totalW = weights.reduce((a,b)=>a+b,0);
    let roll = Math.random() * totalW, cum = 0, reward = 0;
    for (let i = 0; i < rewardOptions.length; i++) {
      cum += weights[i];
      if (roll < cum) {
        reward = rewardOptions[i];
        break;
      }
    }

    // credit user
    const user = await User
      .findById(userId)
      .populate('inventory.item');

    const mult = rewardMultiplier(user);
    await consumeOneShot(user, ['reward-multiplier']);
    user.balance += Math.round(reward * mult);
    user.spinnerPlays = (user.spinnerPlays || 0) + 1;
    await user.save();

    // set next cooldown
    prog.cooldowns[cooldownField] = new Date(now.getTime() + cooldownMs);
    await prog.save();

    return res.json({
      reward,
      nextSpin: prog.cooldowns[cooldownField].toISOString(),
      balance:  user.balance
    });
  } catch (err) {
    console.error(`Spinner ${opts.cooldownField} error:`, err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

/** hourly spinner */
exports.spinSpinner = (req, res) =>
  spinTiered(req, res, {
    cooldownField: 'spinner',
    cooldownMs:    1 * 60 * 60 * 1000,          // 1h
    rewardOptions: [0, 10, 20, 30, 50, 75, 100, 150, 200],
    weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
  });

/** every 12 hours */
exports.spinSpinner12 = (req, res) =>
  spinTiered(req, res, {
    cooldownField: 'spinner12',
    cooldownMs:    12 * 60 * 60 * 1000,         // 12h
    rewardOptions: [0, 50, 100, 150, 250, 400, 600, 900, 1200],
    weights:       [15, 25, 30, 15, 10, 4, 1, 0.5, 0.5]
  });

/** once a day */
exports.spinSpinnerDaily = (req, res) =>
  spinTiered(req, res, {
    cooldownField: 'spinnerDaily',
    cooldownMs:    24 * 60 * 60 * 1000,         // 24h
    rewardOptions: [0, 200, 400, 600, 1000, 1500, 2000, 3000, 4000],
    weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
  });

/** once a week */
exports.spinSpinnerWeekly = (req, res) =>
  spinTiered(req, res, {
    cooldownField: 'spinnerWeekly',
    cooldownMs:    7 * 24 * 60 * 60 * 1000,     // 7d
    rewardOptions: [0, 500, 1000, 1500, 2500, 4000, 6000, 8000, 10000],
    weights:       [10, 20, 25, 20, 10, 8, 5, 1, 1]
  });


exports.getFrenzyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    let prog = await GameProgress.findOne({ user: userId });
    // create if missing
    if (!prog) prog = await GameProgress.create({ user: userId });

    const now = new Date();
    // reset window if it's been over an hour
    if (!prog.frenzyResetAt || now - prog.frenzyResetAt >= 60*60*1000) {
      prog.frenzyResetAt = now;
      prog.frenzyTotal   = 0;
      await prog.save();
    }

    const user = await User.findById(userId);
    return res.json({
      frenzyTotal:   prog.frenzyTotal,
      frenzyResetAt: prog.frenzyResetAt.toISOString(),
      balance:       user.balance
    });
  } catch (err) {
    console.error('Click Frenzy GET error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/games/click-frenzy
 */
exports.playFrenzy = async (req, res) => {
  try {
    const userId = req.user.id;
    let prog = await GameProgress.findOne({ user: userId });
    if (!prog) {
      prog = await GameProgress.create({
        user:          userId,
        frenzyTotal:   0,
        frenzyResetAt: new Date()
      });
    }

    const now = Date.now();
    if (!prog.frenzyResetAt || now - prog.frenzyResetAt >= 3600_000) {
      prog.frenzyResetAt = new Date();
      prog.frenzyTotal   = 0;
    }

    const clicks    = Math.max(0, parseInt(req.body.clicks, 10) || 0);
    const emoji     = req.body.emoji;
    const remaining = MAX_FRENZY_PER_HOUR - prog.frenzyTotal;
    if (remaining <= 0) {
      await prog.save();
      return res.status(429).json({ message: 'Hourly limit reached!' });
    }

    const usedClicks = Math.min(clicks, remaining);
    prog.frenzyTotal += usedClicks;
    await prog.save();

    const baseReward = ICON_REWARDS[emoji] || 5;
    const userDoc    = await User.findById(userId).populate('inventory.item');

    // profit = baseReward
    const boostedProfit = Math.round(baseReward * (rewardMultiplier(userDoc) - 1));
    await consumeOneShot(userDoc, ['reward-multiplier']);
    userDoc.balance += baseReward + boostedProfit;
    userDoc.clickFrenzyPlays = (userDoc.clickFrenzyPlays || 0) + 1;
    await userDoc.save();

    return res.json({
      baseReward,
      boostedProfit,
      frenzyTotal:   prog.frenzyTotal,
      frenzyResetAt: prog.frenzyResetAt.toISOString(),
      balance:       userDoc.balance
    });
  } catch (err) {
    console.error('Click Frenzy error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};



/**
 * POST /api/games/casino
 */
exports.playCasino = async (req, res) => {
  try {
    const userId    = req.user.id;
    const betAmount = parseFloat(req.body.betAmount);
    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    const user = await User.findById(userId);
    if (user.balance < betAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // deduct stake
    user.balance -= betAmount;
    user.casinoPlays = (user.casinoPlays || 0) + 1;
    await user.save();

    const win = Math.random() < 0.5;
    let payout = 0, boostedProfit = 0;
    if (win) {
      const baseProfit = betAmount; // win pays 2×, so profit = betAmount
      // apply multiplier only to profit
      const mult = rewardMultiplier(user);
      boostedProfit = Math.round(baseProfit * (mult - 1));
      user.balance += betAmount + baseProfit + boostedProfit;
      user.gamblingWon = (user.gamblingWon || 0) + (baseProfit + boostedProfit);
      await consumeOneShot(user, ['reward-multiplier']);
      await user.save();
      payout = betAmount*2 + boostedProfit;
    } else {
      user.gamblingLost = (user.gamblingLost || 0) + betAmount;
      await user.save();
    }

    return res.json({
      win,
      wager: betAmount,
      payout,
      boostedProfit,
      balance: user.balance
    });
  } catch (err) {
    console.error('Casino error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/games/roulette
 */
exports.playRoulette = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount, color } = req.body;
    const amt = parseFloat(betAmount);
    if (!amt || amt <= 0 || !['red','black','green'].includes(color)) {
      return res.status(400).json({ message: 'Invalid bet or color' });
    }

    const user = await User.findById(userId).populate('inventory.item');
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    user.roulettePlays = (user.roulettePlays || 0) + 1;
    await user.save();

    const slot = Math.floor(Math.random()*37);
    let resultColor = slot===0 ? 'green' : slot<=18 ? 'red' : 'black';
    const win = resultColor===color;
    let payout=0, boostedProfit=0;
    if (win) {
      const baseProfit = color==='green' ? amt*14 - amt : amt*2 - amt;
      const mult = rewardMultiplier(user);
      boostedProfit = Math.round(baseProfit * (mult - 1));
      user.balance += amt + baseProfit + boostedProfit;
      user.gamblingWon = (user.gamblingWon||0) + (baseProfit+boostedProfit);
      await consumeOneShot(user, ['reward-multiplier']);
      await user.save();
      payout = (color==='green'?amt*14:amt*2) + boostedProfit;
    } else {
      user.gamblingLost = (user.gamblingLost||0) + amt;
      await user.save();
    }

    return res.json({
      win,
      wager: amt,
      choice: color,
      result: resultColor,
      payout,
      boostedProfit,
      balance: user.balance
    });
  } catch (err) {
    console.error('Roulette error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/games/coin-flip
 */
exports.playCoinFlip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount, guess } = req.body;
    const amt = parseFloat(betAmount);
    if (!amt || amt <= 0 || !['heads','tails'].includes(guess)) {
      return res.status(400).json({ message: 'Invalid bet or guess' });
    }

    const user = await User.findById(userId).populate('inventory.item');
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    user.coinFlipPlays = (user.coinFlipPlays || 0) + 1;
    await user.save();

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result===guess;
    let payout=0, boostedProfit=0;
    if (win) {
      const baseProfit = amt*2 - amt;
      const mult = rewardMultiplier(user);
      boostedProfit = Math.round(baseProfit * (mult - 1));
      user.balance += amt + baseProfit + boostedProfit;
      user.gamblingWon = (user.gamblingWon||0) + (baseProfit+boostedProfit);
      await consumeOneShot(user, ['reward-multiplier']);
      await user.save();
      payout = amt*2 + boostedProfit;
    } else {
      user.gamblingLost = (user.gamblingLost||0) + amt;
      await user.save();
    }

    return res.json({
      win,
      wager: amt,
      guess,
      result,
      payout,
      boostedProfit,
      balance: user.balance
    });
  } catch (err) {
    console.error('Coin Flip error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


/**
 * POST /api/games/slots
*/
 const SYMBOLS = [
  '🍒','🍋','🍉','⭐','7️⃣','💎','🔔','🍇','🥝','🎰',
  '💰','🍓','🍊','👑','🃏','🍀','🪙','🛎️','🌈','🔥','💣'
];

const MULTIPLIERS = {
  '7️⃣': 15,
  '💎': 12,
  '👑': 10,
  '⭐': 8,
  '💰': 7,
  '🔔': 6,
  '🎰': 6,
  '🍒': 5,
  '🍉': 4,
  '🍇': 4,
  '🍋': 3,
  '🍊': 3,
  '🍓': 3,
  '🥝': 2,
  '🃏': 2,
  '🍀': 2,
  '🛎️': 1.5,
  '🪙': 1.5,
  '🌈': 1,
  '🔥': 1,
  '💣': 0  // bomb = no payout even on match
};

// Define custom combination wins
const SPECIAL_COMBOS = [
  {
    name: 'Jackpot Trio',
    symbols: ['💎', '7️⃣', '⭐'],
    multiplier: 20,
  },
  {
    name: 'Fruit Medley',
    symbols: ['🍒', '🍋', '🍉'],
    multiplier: 5,
  },
  {
    name: 'Berry Bonus',
    symbols: ['🍇', '🍇', '🍒'],
    exact: true,
    multiplier: 4,
  },
  {
    name: 'Double Lucky',
    symbols: ['7️⃣', '7️⃣'],
    matchTwoOnly: true,
    multiplier: 3,
  },
  {
    name: 'Juicy Row',
    symbols: ['🥝', '🍉', '🍇'],
    multiplier: 2.5,
  },
  {
    name: 'Firebomb',
    symbols: ['🔥', '💣', '🔥'],
    exact: true,
    multiplier: 7,
  },
  {
    name: 'Triple Crown',
    symbols: ['👑', '👑', '👑'],
    exact: true,
    multiplier: 25,
  },
  {
    name: 'Triple Jokers',
    symbols: ['🃏', '🃏', '🃏'],
    exact: true,
    multiplier: 10,
  }
];

function matchesCombo(combo, reel) {
  if (combo.exact) {
    return JSON.stringify(reel) === JSON.stringify(combo.symbols);
  }
  const reelCopy = [...reel];
  return combo.symbols.every(sym => {
    const idx = reelCopy.indexOf(sym);
    if (idx !== -1) {
      reelCopy.splice(idx, 1);
      return true;
    }
    return false;
  });
}

exports.playSlots = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount } = req.body;
    const amt = parseFloat(betAmount);
    if (!amt || amt<=0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    // 1) pull buffs for guaranteed win
    const user = await User.findById(userId).populate('inventory.item');
    const luckBuffs = await getUserBuffs(user, ['slots-luck']);
    let guaranteedWin=false;
    if (luckBuffs.length) {
      const boost = luckBuffs.reduce((s,b)=>s+b.effectValue,0);
      if (Math.random() < boost/100) guaranteedWin=true;
      await consumeOneShot(user, ['slots-luck']);
      await user.save();
    }

    // 2) deduct stake
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    user.balance -= amt;
    user.slotsPlays = (user.slotsPlays||0) + 1;
    await user.save();

    // 3) spin reels
    let reel;
    if (guaranteedWin) {
      const winners = Object.entries(MULTIPLIERS).filter(([,m])=>m>0).map(([s])=>s);
      const pick = winners[Math.floor(Math.random()*winners.length)];
      reel = [pick,pick,pick];
    } else {
      reel = Array.from({length:3},()=>SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]);
    }

    // 4) evaluate combos
    const counts = reel.reduce((a,s)=>{a[s]=(a[s]||0)+1;return a}, {});
    let win=false, payout=0, comboName=null;
    for (let combo of SPECIAL_COMBOS) {
      if (matchesCombo(combo,reel) && (!combo.matchTwoOnly||Object.values(counts).includes(2))) {
        win=true; payout=Math.floor(amt*combo.multiplier); comboName=combo.name; break;
      }
    }
    if (!win) {
      for (let sym in counts) {
        if (counts[sym]===3) { win=true; payout=Math.floor(amt*(MULTIPLIERS[sym]||1)); break; }
      }
    }
    if (!win) {
      for (let sym in counts) {
        if (counts[sym]===2 && MULTIPLIERS[sym]) {
          win=true; payout=Math.floor(amt*((MULTIPLIERS[sym]||1)/2)); break;
        }
      }
    }

    // 5) apply multiplier only to profit (payout - stake)
    let boostedProfit=0;
    if (win && payout>0) {
      const baseProfit = payout - amt;
      const mult = rewardMultiplier(user);
      boostedProfit = Math.round(baseProfit * (mult - 1));
      user.balance += payout + boostedProfit;
      user.gamblingWon = (user.gamblingWon||0) + (baseProfit+boostedProfit);
      await consumeOneShot(user, ['reward-multiplier']);
      await user.save();
    } else if (!win) {
      user.gamblingLost = (user.gamblingLost||0) + amt;
      await user.save();
    }

    return res.json({
      reel,
      win,
      payout,
      boostedProfit,
      combo: comboName,
      balance: user.balance
    });
  } catch (err) {
    console.error('Slots error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};



/**
 * GET /api/games/rps/invites
 * Return any pending RPS challenges addressed to the current user.
 */
exports.getRPSInvites = async (req, res) => {
  try {
    // find invites where “to” is this user
    const invites = await RPSChallenge.find({ to: req.user.id })
      .populate('from', 'username')
      .lean();

    // format them
    const output = invites.map(inv => ({
      _id:         inv._id,
      fromUsername: inv.from.username,
      buyIn:       inv.buyIn
    }));

    return res.json(output);
  } catch (err) {
    console.error('RPS invites error:', err);
    return res.status(500).json({ message: 'Failed to load invites' });
  }
};
/**
 * GET /api/games/rps
 */
exports.getRPSStats = async (req, res) => {
  try {
    const prog = await GameProgress.findOne({ user: req.user.id }).lean();
    res.json({
      wins: prog.rpsWins || 0,
      games: prog.rpsGames || 0
    });
  } catch (err) {
    console.error('RPS stats error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getRPSHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json(user.rpsHistory?.slice(-10).reverse() || []);
  } catch (err) {
    console.error('RPS history error:', err);
    res.status(500).json({ message: 'Failed to load history' });
  }
};

/**
 * POST /api/games/rps
 */
exports.playRPS = async (req, res) => {
  try {
    const { opponentUsername, buyIn, userChoice } = req.body;
    if (!opponentUsername || !buyIn || !['rock','paper','scissors'].includes(userChoice)) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const challengerId = req.user.id;
    const opponent = await User.findOne({ username: opponentUsername });
    if (!opponent) {
      return res.status(400).json({ message: 'Opponent not found' });
    }

    const opponentId = opponent._id.toString();

    const invite = await RPSChallenge.findOne({
      from: opponent._id,
      to: challengerId
    });

    if (invite) {
      const [user, opp] = await Promise.all([
        User.findById(challengerId),
        User.findById(opponent._id)
      ]);

      if (user.balance < invite.buyIn) {
        return res.status(400).json({ message: 'You have insufficient funds' });
      }
      if (opp.balance < invite.buyIn) {
        return res.status(400).json({ message: 'Opponent has insufficient funds' });
      }

      user.balance -= invite.buyIn;
      opp.balance  -= invite.buyIn;
      user.rpsPlays = (user.rpsPlays || 0) + 1;
      opp.rpsPlays  = (opp.rpsPlays || 0) + 1;
      await Promise.all([user.save(), opp.save()]);

      const userPick = userChoice;
      const oppPick  = invite.choice;
      const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

      let winner = null;
      if (userPick !== oppPick) {
        if (beats[userPick] === oppPick) {
          winner = challengerId;
        } else if (beats[oppPick] === userPick) {
          winner = opponentId;
        }
      }

      // payout
      if (winner) {
        const pot = invite.buyIn * 2;
        const winUser = winner === challengerId ? user : opp;
        winUser.balance += Math.round(pot * rewardMultiplier(user));
        winUser.gamblingWon = (winUser.gamblingWon || 0) + (pot * rewardMultiplier(user) - invite.buyIn);
        await winUser.save();

        await GameProgress.findOneAndUpdate(
          { user: winner },
          { $inc: { rpsWins: 1 } },
          { upsert: true }
        );
      } else {
        // draw → refund
        user.balance += invite.buyIn;
        opp.balance  += invite.buyIn;
        await Promise.all([user.save(), opp.save()]);
      }

      await GameProgress.updateMany(
        { user: { $in: [challengerId, opponent._id] } },
        { $inc: { rpsGames: 1 } }
      );

      // record match history
      const outcomeUser = winner ? (winner === challengerId ? 'win' : 'lose') : 'draw';
      const outcomeOpp  = winner ? (winner === opponentId ? 'win' : 'lose') : 'draw';

      user.rpsHistory = user.rpsHistory || [];
      opp.rpsHistory  = opp.rpsHistory  || [];

      user.rpsHistory.push({
        opponent: opponent.username,
        buyIn: invite.buyIn,
        yourPick: userPick,
        theirPick: oppPick,
        outcome: outcomeUser
      });

      opp.rpsHistory.push({
        opponent: user.username,
        buyIn: invite.buyIn,
        yourPick: oppPick,
        theirPick: userPick,
        outcome: outcomeOpp
      });

      await Promise.all([user.save(), opp.save()]);
      await invite.deleteOne();

      return res.json({
        userPick,
        oppPick,
        winner,
        balance: {
          you: user.balance,
          opponent: opp.balance
        }
      });
    } else {
      // send a challenge
      await RPSChallenge.create({
        from: challengerId,
        to: opponent._id,
        buyIn,
        choice: userChoice
      });

      return res.json({
        message: `Challenge sent to ${opponentUsername}. They have 5 minutes to accept by challenging you back.`
      });
    }
  } catch (err) {
    console.error('RPS error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


/**
 * GET /api/games/puzzle-rush
 */
exports.getPuzzleRush = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    let daily = await DailyPuzzle.findOne({ date: today }).lean();

    if (!daily) {
      const puzzles = [
        generateMatch3(),
        generateSliding(),
        generateMemory(),
        generateLogicGrid(),
        generateNQueens()
      ];
      daily = await DailyPuzzle.create({ date: today, puzzles });
    }

    // reset user daily counter if needed
    let prog = await GameProgress.findOne({ user: req.user.id });

    if (!prog) {
      prog = await GameProgress.create({ user: req.user.id });
    }

    const now  = new Date();
    if (!prog.puzzleRushResetAt
      || now - prog.puzzleRushResetAt >= 24*3600*1000) {
      prog.puzzleRushResetAt = now;
      prog.puzzleRushTotal   = 0;
      prog.puzzleRushSolved   = [];
      await prog.save();
    }

    return res.json({
      puzzles:    daily.puzzles,
      wins:       prog.puzzleRushTotal,
      solved:     prog.puzzleRushSolved,
      resetAt:    prog.puzzleRushResetAt.toISOString()
    });
  } catch (err) {
    console.error('PuzzleRush GET error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/games/puzzle-rush
 */
exports.playPuzzleRush = async (req, res) => {
  try {
    const { puzzleId, answer } = req.body;
    const today = new Date().toISOString().slice(0,10);

    // 1) load today's puzzle set
    const daily = await DailyPuzzle.findOne({ date: today }).lean();
    if (!daily) {
      return res.status(500).json({ message: 'Daily puzzles not initialized' });
    }
    const puzzle = daily.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    // 2) load or create this user's progress
    let prog = await GameProgress.findOne({ user: req.user.id });
    if (!prog) {
      prog = await GameProgress.create({
        user:               req.user.id,
        puzzleRushTotal:    0,
        puzzleRushSolved:   [],
        puzzleRushResetAt:  Date.now()
      });
    }

    // 3) reset daily counters if it's a new day
    const now = Date.now();
    if (!prog.puzzleRushResetAt || now - prog.puzzleRushResetAt >= 24*3600*1000) {
      prog.puzzleRushTotal   = 0;
      prog.puzzleRushSolved  = [];
      prog.puzzleRushResetAt = now;
      await prog.save();
    }

    // 4) prevent double-solves
    if (prog.puzzleRushSolved.includes(puzzleId)) {
      return res.status(400).json({ message: 'You already solved that puzzle today' });
    }

    // 5) validate answer
    let correct = false;

    if (puzzle.type === 'match-3') {
      correct = typeof answer?.count === 'number' && answer.count >= 20;
    } else if (puzzle.type === 'n-queens') {
      const queens = answer.positions;
      const regions = puzzle.question.regions;
      const N = 8;
      if (!Array.isArray(queens) || queens.length !== N) {
        return res.status(400).json({ message: 'Must place exactly 8 queens.' });
      }
      // build and validate board...
      const rowSet = new Set(), colSet = new Set(), regionSet = new Set();
      for (const [r, c] of queens) {
        if (r < 0 || r >= N || c < 0 || c >= N) {
          return res.status(400).json({ message: `Invalid queen position: (${r}, ${c})` });
        }
        if (rowSet.has(r))    return res.status(400).json({ message: `More than one queen in row ${r+1}` });
        if (colSet.has(c))    return res.status(400).json({ message: `More than one queen in column ${c+1}` });
        for (const [r2, c2] of queens) {
          if ((r !== r2 || c !== c2) && Math.abs(r-r2)===1 && Math.abs(c-c2)===1) {
            return res.status(400).json({ message: `Diagonal conflict between (${r+1},${c+1}) and (${r2+1},${c2+1})` });
          }
        }
        const reg = regions[r]?.[c];
        if (reg != null && regionSet.has(reg)) {
          return res.status(400).json({ message: `More than one queen in region ${reg+1}` });
        }
        rowSet.add(r);
        colSet.add(c);
        if (reg != null) regionSet.add(reg);
      }
      if (rowSet.size===N && colSet.size===N && regionSet.size===N) {
        correct = true;
      }
    } else if (puzzle.type === 'logic-grid') {
      correct = JSON.stringify(answer) === JSON.stringify(puzzle.solution);
    } else {
      correct = JSON.stringify(answer) === JSON.stringify(puzzle.solution);
    }

    if (!correct) {
      return res.status(400).json({ message: 'Incorrect solution' });
    }

    // 6) award coins and record solve
    const reward = puzzle.type === 'logic-grid' ? 2000 : 250;
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: reward } });

    prog.puzzleRushTotal += 1;
    prog.puzzleRushSolved.push(puzzleId);
    await prog.save();

    // 7) return updated stats
    const updatedProg = await GameProgress.findOne({ user: req.user.id }).lean();
    const userDoc     = await User.findById(req.user.id);
    return res.json({
      reward,
      wins:    updatedProg.puzzleRushTotal,
      solved:  updatedProg.puzzleRushSolved,
      resetAt: updatedProg.puzzleRushResetAt.toISOString(),
      balance: userDoc.balance
    });

  } catch (err) {
    console.error('PuzzleRush POST error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * GET /api/games/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const [topRps, topPuzzle] = await Promise.all([
      GameProgress.find().sort({ rpsWins:-1 }).limit(10).populate('user','username').lean(),
      GameProgress.find().sort({ puzzleRushTotal:-1 }).limit(10).populate('user','username').lean()
    ]);

    return res.json({
      rps: topRps
        .filter(p => p.user && p.user.username)
        .map(p => ({
          username: p.user.username,
          wins:     p.rpsWins,
          games:    p.rpsGames
        })),
        puzzleRush: topPuzzle
          .filter(p => p.user && p.user.username)
          .map(p => ({
            username: p.user.username,
            wins:     p.puzzleRushTotal
          }))
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};