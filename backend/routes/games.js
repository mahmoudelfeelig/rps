const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProgress,
  spinSpinner,
  spinSpinner12,
  spinSpinnerDaily,
  spinSpinnerWeekly,
  getFrenzyStats,
  playFrenzy,
  playCasino,
  playRoulette,
  playCoinFlip,
  playSlots,
  getRPSInvites,
  getRPSStats,
  playRPS,
  getRPSHistory,
  getPuzzleRush,
  playPuzzleRush,
  getLeaderboard,
} = require('../controllers/gameController');

// progress
router.get(    '/progress',       authenticate, getProgress);

// spinners
router.post(   '/spinner',        authenticate, spinSpinner);
router.post(   '/spinner12',      authenticate, spinSpinner12);
router.post(   '/spinnerDaily',   authenticate, spinSpinnerDaily);
router.post(   '/spinnerWeekly',  authenticate, spinSpinnerWeekly);

// click frenzy
router.get(    '/click-frenzy',   authenticate, getFrenzyStats);
router.post(   '/click-frenzy',   authenticate, playFrenzy);

// casino games
router.post(   '/casino',         authenticate, playCasino);
router.post(   '/roulette',       authenticate, playRoulette);
router.post(   '/coin-flip',      authenticate, playCoinFlip);
router.post(   '/slots',          authenticate, playSlots);

// rock-paper-scissors
router.get(    '/rps',            authenticate, getRPSStats);
router.post(   '/rps',            authenticate, playRPS);
router.get(    '/rps/invites',  authenticate, getRPSInvites);
router.get(    'rps/history', authenticate, getRPSHistory);

// puzzle rush
router.get(    '/puzzle-rush',    authenticate, getPuzzleRush);
router.post(   '/puzzle-rush',    authenticate, playPuzzleRush);

// combined leaderboard for RPS & PuzzleRush
router.get(    '/leaderboard',    authenticate, getLeaderboard);

module.exports = router;