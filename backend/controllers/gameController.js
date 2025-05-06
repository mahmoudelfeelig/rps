const GameProgress = require('../models/GameProgress');
const User = require('../models/User');

exports.getProgress = async (req, res) => {
  try {
    let progress = await GameProgress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await GameProgress.create({ user: req.user.id });
    }
    return res.json({
      unlockedGames: progress.unlockedGames,
      cooldowns: {
        spinner: progress.cooldowns.spinner?.toISOString() || null
      }
    });
  } catch (err) {
    console.error('Error fetching game progress:', err);
    return res.status(500).json({ message: 'Failed to load progress' });
  }
};

exports.spinSpinner = async (req, res) => {
  try {
    const userId   = req.user.id;
    const progress = await GameProgress.findOne({ user: userId });
    if (!progress) {
      return res.status(404).json({ message: 'Game progress not found' });
    }

    const now           = new Date();
    const lastNextSpin  = progress.cooldowns.spinner;
    const cooldownHours = 1;

    // block if still on cooldown
    if (lastNextSpin && now < new Date(lastNextSpin)) {
      return res.status(429).json({ message: 'Come back later!' });
    }

    // spin weights
    const rewardOptions = [0, 50, 100, 150, 200, 300, 500, 750, 1000];
    const weights       = [10, 20, 25, 20, 10, 8, 5, 1, 1];
    let roll = Math.random() * 100;
    let cumulative = 0;
    let reward = 0;

    for (let i = 0; i < rewardOptions.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        reward = rewardOptions[i];
        break;
      }
    }

    // award user
    const user = await User.findById(userId);
    user.balance += reward;
    await user.save();

    // set nextSpin
    const nextSpin = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
    progress.cooldowns.spinner = nextSpin;
    await progress.save();

    return res.json({
      reward,
      nextSpin: nextSpin.toISOString()
    });
  } catch (err) {
    console.error('Spinner error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
