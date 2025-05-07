const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProgress,
  spinSpinner,
  spinSpinner12,
  spinSpinnerDaily,
  spinSpinnerWeekly,
  playFrenzy,
  playCasino,
  playRoulette,
  playCoinFlip,
  playSlots
} = require('../controllers/gameController');

router.get(
  '/progress',
  authenticate,
  getProgress
);

router.post('/spinner',       authenticate, spinSpinner);
router.post('/spinner12',     authenticate, spinSpinner12);
router.post('/spinnerDaily',  authenticate, spinSpinnerDaily);
router.post('/spinnerWeekly', authenticate, spinSpinnerWeekly);

router.post(
  '/click-frenzy',
  authenticate,
  playFrenzy
);

router.post(
  '/casino',
  authenticate,
  playCasino
);

router.post(
  '/roulette',
  authenticate,
  playRoulette
);

router.post(
  '/coin-flip',
  authenticate,
  playCoinFlip
);

router.post(
  '/slots',
  authenticate,
  playSlots
);

module.exports = router;