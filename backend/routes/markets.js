const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getMarket,
  buyAsset,
  sellAsset,
  claimDividends,
  prestige
} = require('../controllers/marketController');

router.get('/', authenticate, getMarket);
router.post('/buy', authenticate, buyAsset);
router.post('/sell', authenticate, sellAsset);
router.post('/dividends', authenticate, claimDividends);
router.post('/prestige', authenticate, prestige);

module.exports = router;
