const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  startRound,
  revealCell,
  cashOut
} = require('../controllers/minefieldController');

const router = express.Router();

router.post('/start',    authenticate, startRound);
router.post('/reveal',   authenticate, revealCell);
router.post('/cashout',  authenticate, cashOut);

module.exports = router;