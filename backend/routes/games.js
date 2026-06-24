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
  playCrash,
  playHigherLower,
  playDiceDuel,
  playBotRace,
  getDailyArcade,
  solveDailyArcade,
  getBlackjackState,
  startBlackjack,
  hitBlackjack,
  standBlackjack,
  playRoulette,
  playCoinFlip,
  playSlots,
  getRPSInvites,
  getRPSBots,
  getRPSStats,
  playRPS,
  getRPSHistory,
  getPuzzleRush,
  playPuzzleRush,
  getLeaderboard,
} = require('../controllers/gameController');

router.get(    '/progress',       authenticate, getProgress);

router.post(   '/spinner',        authenticate, spinSpinner);
router.post(   '/spinner12',      authenticate, spinSpinner12);
router.post(   '/spinnerDaily',   authenticate, spinSpinnerDaily);
router.post(   '/spinnerWeekly',  authenticate, spinSpinnerWeekly);

router.get(    '/click-frenzy',   authenticate, getFrenzyStats);
router.post(   '/click-frenzy',   authenticate, playFrenzy);

router.post(   '/casino',         authenticate, playCasino);
router.post(   '/crash',          authenticate, playCrash);
router.post(   '/higher-lower',   authenticate, playHigherLower);
router.post(   '/dice-duel',      authenticate, playDiceDuel);
router.post(   '/bot-race',       authenticate, playBotRace);
router.get(    '/daily-arcade',   authenticate, getDailyArcade);
router.post(   '/daily-arcade/solve', authenticate, solveDailyArcade);
router.get(    '/blackjack',      authenticate, getBlackjackState);
router.post(   '/blackjack/start', authenticate, startBlackjack);
router.post(   '/blackjack/hit',   authenticate, hitBlackjack);
router.post(   '/blackjack/stand', authenticate, standBlackjack);
router.post(   '/roulette',       authenticate, playRoulette);
router.post(   '/coin-flip',      authenticate, playCoinFlip);
router.post(   '/slots',          authenticate, playSlots);

router.get(    '/rps',            authenticate, getRPSStats);
router.get(    '/rps/bots',       authenticate, getRPSBots);
router.post(   '/rps',            authenticate, playRPS);
router.get(    '/rps/invites',  authenticate, getRPSInvites);
router.get(    '/rps/history',    authenticate, getRPSHistory);

router.get(    '/puzzle-rush',    authenticate, getPuzzleRush);
router.post(   '/puzzle-rush',    authenticate, playPuzzleRush);

router.get(    '/leaderboard',    authenticate, getLeaderboard);

module.exports = router;
