const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const GameProgress = require('../models/GameProgress');
const User = require('../models/User');

router.get('/progress', authenticate, async (req, res) => {
  let progress = await GameProgress.findOne({ user: req.user.id });
  if (!progress) {
    progress = await GameProgress.create({ user: req.user.id });
  }
  res.json({ unlockedGames: progress.unlockedGames });
});

router.post('/spinner', authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const gameData = await GameProgress.findOne({ user: userId });
      if (!gameData) return res.status(404).json({ message: 'Game progress not found' });
  
      const now = new Date();
      const lastSpin = gameData.cooldowns?.spinner;
      const cooldownHours = 1;
  
      if (lastSpin && (now - new Date(lastSpin)) < cooldownHours * 60 * 60 * 1000) {
        return res.status(429).json({ message: 'Come back Later!' });
      }
  
      // Spinner reward logic
      const rewardOptions = [0, 50, 100, 150, 200, 300, 500, 750, 1000];
      const weights =       [10, 20, 25, 20, 10, 8, 5, 1, 1]; // Total = 100
  
      const roll = Math.random() * 100;
      let cumulative = 0;
      let reward = 0;
  
      for (let i = 0; i < rewardOptions.length; i++) {
        cumulative += weights[i];
        if (roll < cumulative) {
          reward = rewardOptions[i];
          break;
        }
      }
  
      // Grant reward
      const user = await User.findById(userId);
      user.balance += reward;
      await user.save();
  
      // Update cooldown
      gameData.cooldowns.spinner = now;
      await gameData.save();
  
      res.json({ reward, nextSpin: new Date(now.getTime() + cooldownHours * 60 * 60 * 1000) });
  
    } catch (err) {
      console.error('Spinner error:', err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });

module.exports = router;