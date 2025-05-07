const GameProgress = require('../models/GameProgress');
const User         = require('../models/User');
const MAX_FRENZY_PER_HOUR = 100;

/**
 * GET /api/games/progress
 */
exports.getProgress = async (req, res) => {
  try {
    let prog = await GameProgress.findOne({ user: req.user.id });
    if (!prog) prog = await GameProgress.create({ user: req.user.id });

    // bundle up the rewardOptions & weights for each spinner
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
      spinners: spinnerConfigs
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
 * Now pays out:
 *  • Three of a kind ✕ symbol‐specific multiplier
 *  • Two of a kind ✕ half of that multiplier
 */
exports.playSlots = async (req, res) => {
  try {
    const userId     = req.user.id;
    const { betAmount } = req.body;
    const amt        = parseFloat(betAmount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    const user = await User.findById(userId);
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= amt;
    await user.save();

    const symbols = ['🍒','🍋','🍉','⭐','7️⃣'];
    const reel    = Array.from({ length: 3 }, () =>
      symbols[Math.floor(Math.random() * symbols.length)]
    );

    const counts = reel.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const multipliers = {
      '7️⃣': 10,
      '⭐':  5,
      '🍒':  3,
      '🍉':  2,
      '🍋':  2
    };

    let win    = false;
    let payout = 0;

    for (let sym in counts) {
      if (counts[sym] === 3) {
        win    = true;
        payout = amt * multipliers[sym];
        break;
      }
    }

    if (!win) {
      for (let sym in counts) {
        if (counts[sym] === 2) {
          win    = true;
          payout = Math.floor(amt * (multipliers[sym] / 2));
          break;
        }
      }
    }

    if (win) {
      user.balance += payout;
      await user.save();
    }

    return res.json({
      reel,
      win,
      payout,
      balance: user.balance
    });
  } catch (err) {
    console.error('Slots error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};