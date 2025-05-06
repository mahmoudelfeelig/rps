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
    return res.json({
      unlockedGames: prog.unlockedGames,
      cooldowns: {
        spinner:     prog.cooldowns.spinner?.toISOString()    || null,
        clickFrenzy: prog.cooldowns.clickFrenzy?.toISOString() || null
      }
    });
  } catch (err) {
    console.error('Error fetching game progress:', err);
    return res.status(500).json({ message: 'Failed to load progress' });
  }
};

/**
 * POST /api/games/spinner
 */
exports.spinSpinner = async (req, res) => {
  try {
    const userId   = req.user.id;
    const prog     = await GameProgress.findOne({ user: userId });
    if (!prog) return res.status(404).json({ message: 'Game progress not found' });

    const now          = new Date();
    const lastNextSpin = prog.cooldowns.spinner;
    const cooldownMs   = 60 * 60 * 1000;
    if (lastNextSpin && now < new Date(lastNextSpin)) {
      return res.status(429).json({ message: 'Come back later!' });
    }

    const rewardOptions = [0,50,100,150,200,300,500,750,1000];
    const weights       = [10,20,25,20,10,8,5,1,1];
    let roll = Math.random() * 100, cum=0, reward=0;
    for (let i=0; i<rewardOptions.length; i++){
      cum += weights[i];
      if (roll < cum) {
        reward = rewardOptions[i];
        break;
      }
    }

    const user = await User.findById(userId);
    user.balance += reward;
    await user.save();

    prog.cooldowns.spinner = new Date(now.getTime() + cooldownMs);
    await prog.save();

    return res.json({
      reward,
      nextSpin: prog.cooldowns.spinner.toISOString(),
      balance:  user.balance
    });
  } catch (err) {
    console.error('Spinner error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

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
    if (!prog.frenzyResetAt || now - prog.frenzyResetAt >= 60*60*1000) {
      prog.frenzyResetAt = now;
      prog.frenzyTotal   = 0;
    }

    // desired coins = number of clicks (1 coin each)
    const clicks = Math.max(0, parseInt(req.body.clicks, 10) || 0);
    // how many left in this hour
    const remaining = MAX_FRENZY_PER_HOUR - prog.frenzyTotal;
    if (remaining <= 0) {
      return res.status(429).json({ message: 'Hourly limit reached!' });
    }

    const reward = Math.min(clicks, remaining);

    // credit user
    const user = await User.findById(userId);
    user.balance += reward;
    await user.save();

    // update progress
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

    // debit
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

    // validate
    if (!amt || amt <= 0 || !['red','black','green'].includes(color)) {
      return res.status(400).json({ message: 'Invalid bet or color' });
    }

    // fetch user
    const user = await User.findById(userId);
    if (user.balance < amt) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // debit stake
    user.balance -= amt;
    await user.save();

    // simulate a 37‑slot wheel (0 = green, 1–18 = red, 19–36 = black)
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
      // green pays 14×, red/black pay 2×
      payout = color === 'green' ? amt * 14 : amt * 2;
      user.balance += payout;
      await user.save();
    }

    return res.json({
      win,
      wager:   amt,
      choice:  color,
      result:  resultColor,
      payout,               // 0 if lost, amt*2 for red/black, amt*14 for green
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

    // debit stake
    user.balance -= amt;
    await user.save();

    // spin reels
    const symbols = ['🍒','🍋','🍉','⭐','7️⃣'];
    const reel    = Array.from({ length: 3 }, () =>
      symbols[Math.floor(Math.random() * symbols.length)]
    );

    // count occurrences
    const counts = reel.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // symbol multipliers
    const multipliers = {
      '7️⃣': 10,
      '⭐':  5,
      '🍒':  3,
      '🍉':  2,
      '🍋':  2
    };

    let win    = false;
    let payout = 0;

    // three of a kind
    for (let sym in counts) {
      if (counts[sym] === 3) {
        win    = true;
        payout = amt * multipliers[sym];
        break;
      }
    }

    // two of a kind (half multiplier)
    if (!win) {
      for (let sym in counts) {
        if (counts[sym] === 2) {
          win    = true;
          payout = Math.floor(amt * (multipliers[sym] / 2));
          break;
        }
      }
    }

    // award payout
    if (win) {
      user.balance += payout;
      await user.save();
    }

    return res.json({
      reel,      // e.g. ['🍒','⭐','🍒']
      win,
      payout,    // 0 if lost, or amt×multiplier
      balance:   user.balance
    });
  } catch (err) {
    console.error('Slots error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};