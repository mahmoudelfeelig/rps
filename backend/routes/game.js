const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const GameProgress = require('../models/GameProgress');

router.get('/progress', authenticate, async (req, res) => {
  let progress = await GameProgress.findOne({ user: req.user.id });
  if (!progress) {
    progress = await GameProgress.create({ user: req.user.id });
  }
  res.json(progress);
});

module.exports = router;