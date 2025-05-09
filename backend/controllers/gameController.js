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
    const user = await User.findById(userId);
    user.balance += reward;
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


/**
 * POST /api/games/click-frenzy
 */
exports.playFrenzy = async (req, res) => {
  try {
    const userId = req.user.id;
    let prog     = await GameProgress.findOne({ user: userId });
    if (!prog) prog = await GameProgress.create({ user: userId });

    const now = new Date();
    // if window expired (or never set), reset
    if (!prog.frenzyResetAt || now - prog.frenzyResetAt >= 60 * 60 * 1000) {
      prog.frenzyResetAt = now;
      prog.frenzyTotal   = 0;
    }

    const clicks   = Math.max(0, parseInt(req.body.clicks, 10) || 0);
    const remaining = MAX_FRENZY_PER_HOUR - prog.frenzyTotal;
    if (remaining <= 0) {
      return res.status(429).json({ message: 'Hourly limit reached!' });
    }

    const reward = Math.min(clicks, remaining);

    const user = await User.findById(userId);
    user.balance += reward;
    await user.save();

    prog.frenzyTotal += reward;
    await prog.save();

    return res.json({
      reward,
      frenzyTotal:   prog.frenzyTotal,
      frenzyResetAt: prog.frenzyResetAt.toISOString(),
      balance:       user.balance
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

    user.balance -= betAmount;
    await user.save();

    const win   = Math.random() < 0.5;
    let payout  = 0;
    if (win) {
      payout = betAmount * 2;
      user.balance += payout;
      await user.save();
    }

    return res.json({
      win,
      wager:   betAmount,
      payout,
      balance: user.balance
    });
  } catch (err) {
    console.error('Casino error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/games/roulette
 * Accepts betAmount (number) and color ('red'|'black'|'green').
 * Red/black pay 2×, green pays 14×. True roulette odds: 1/37 for green.
 */
exports.playRoulette = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { betAmount, color } = req.body;
    const amt = parseFloat(betAmount);

    if (!amt || amt <= 0 || !['red','black','green'].includes(color)) {
      return res.status(400).json({ message: 'Invalid bet or color' });
    }

    const user = await User.findById(userId);
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    await user.save();

    const slot = Math.floor(Math.random() * 37);
    let resultColor;
    if (slot === 0) {
      resultColor = 'green';
    } else if (slot <= 18) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }

    const win = resultColor === color;
    let payout = 0;

    if (win) {
      payout = color === 'green' ? amt * 14 : amt * 2;
      user.balance += payout;
      await user.save();
    }

    return res.json({
      win,
      wager:   amt,
      choice:  color,
      result:  resultColor,
      payout,
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
    const userId    = req.user.id;
    const { betAmount, guess } = req.body;
    const amt       = parseFloat(betAmount);
    if (!amt || amt <= 0 || !['heads','tails'].includes(guess)) {
      return res.status(400).json({ message: 'Invalid bet or guess' });
    }

    const user = await User.findById(userId);
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    await user.save();

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win    = result === guess;
    let payout   = 0;
    if (win) {
      payout = amt * 2;
      user.balance += payout;
      await user.save();
    }

    return res.json({
      win,
      wager:   amt,
      guess,
      result,
      payout,
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

    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    const user = await User.findById(userId);
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    await user.save();

    const reel = Array.from({ length: 3 }, () =>
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );

    const counts = reel.reduce((acc, sym) => {
      acc[sym] = (acc[sym] || 0) + 1;
      return acc;
    }, {});

    let win = false;
    let payout = 0;
    let comboName = null;

    // Check special combos first
    for (let combo of SPECIAL_COMBOS) {
      const matched = matchesCombo(combo, reel);
      if (
        matched &&
        (!combo.matchTwoOnly || Object.values(counts).includes(2))
      ) {
        win = true;
        payout = Math.floor(amt * combo.multiplier);
        comboName = combo.name;
        break;
      }
    }

    // If no special combo, check regular matches
    if (!win) {
      for (let sym in counts) {
        if (counts[sym] === 3) {
          win = true;
          payout = Math.floor(amt * (MULTIPLIERS[sym] || 1));
          break;
        }
      }
    }

    if (!win) {
      for (let sym in counts) {
        if (counts[sym] === 2 && MULTIPLIERS[sym]) {
          win = true;
          payout = Math.floor(amt * ((MULTIPLIERS[sym] || 1) / 2));
          break;
        }
      }
    }

    if (win && payout > 0) {
      user.balance += payout;
      await user.save();
    }

    return res.json({
      reel,
      win,
      payout,
      balance: user.balance,
      combo: comboName
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

/**
 * POST /api/games/rps
 */
exports.playRPS = async (req, res) => {
  try {
    const { opponentUsername, buyIn, userChoice } = req.body;
    if (
      !opponentUsername ||
      !buyIn ||
      !['rock','paper','scissors'].includes(userChoice)
    ) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const challengerId = req.user.id;
    const opponent = await User.findOne({ username: opponentUsername });
    if (!opponent) {
      return res.status(400).json({ message: 'Opponent not found' });
    }
    const opponentId = opponent._id.toString();

    // look for an invite from opponent → challenger
    let invite = await RPSChallenge.findOne({
      from: opponent._id,
      to:   challengerId
    });

    if (invite) {
      // both have challenged each other—resolve the game

      // load both user docs
      const [user, opp] = await Promise.all([
        User.findById(challengerId),
        User.findById(opponent._id)
      ]);

      // check balances
      if (user.balance < invite.buyIn || opp.balance < invite.buyIn) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }

      // debit both
      user.balance -= invite.buyIn;
      opp.balance  -= invite.buyIn;
      await Promise.all([user.save(), opp.save()]);

      // determine picks
      const userPick = userChoice;
      const oppPick  = invite.choice;
      let winner = null;
      if (userPick !== oppPick) {
        const beats = { rock:'scissors', paper:'rock', scissors:'paper' };
        winner = beats[userPick] === oppPick
          ? challengerId
          : opponentId;
      }

      // payout or refund
      if (winner) {
        const pot = invite.buyIn * 2;
        const winUser = winner === challengerId ? user : opp;
        winUser.balance += pot;
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

      // increment games played
      await GameProgress.updateMany(
        { user: { $in: [challengerId, opponent._id] } },
        { $inc: { rpsGames: 1 } }
      );

      // remove the invite
      await invite.deleteOne();

      return res.json({
        userPick,
        oppPick,
        winner,
        balance: {
          you:      user.balance,
          opponent: opp.balance
        }
      });
    } else {
      // no matching invite yet → send one
      await RPSChallenge.create({
        from:   challengerId,
        to:     opponent._id,
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
    const prog = await GameProgress.findOne({ user: req.user.id });
    const now  = new Date();
    if (!prog.puzzleRushResetAt
      || now - prog.puzzleRushResetAt >= 24*3600*1000) {
      prog.puzzleRushResetAt = now;
      prog.puzzleRushTotal   = 0;
      await prog.save();
    }

    return res.json({
      puzzles:    daily.puzzles,
      wins:       prog.puzzleRushTotal,
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
    const daily = await DailyPuzzle.findOne({ date: today }).lean();
    const puzzle = daily.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    let correct = false;

    if (puzzle.type === 'match-3') {
      correct = typeof answer?.count === 'number' && answer.count >= 20;
    } else {
      correct = JSON.stringify(answer) === JSON.stringify(puzzle.solution);
    }
    if (!correct) {
      return res.status(400).json({ message: 'Incorrect solution' });
    }

    const reward = 100;
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: reward } });

    const prog = await GameProgress.findOne({ user: req.user.id });
    prog.puzzleRushTotal += 1;
    await prog.save();

    const updatedProg = await GameProgress.findOne({ user: req.user.id }).lean();

    return res.json({
      reward,
      wins:    updatedProg.puzzleRushTotal,
      resetAt: updatedProg.puzzleRushResetAt.toISOString(),
      balance: (await User.findById(req.user.id)).balance
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