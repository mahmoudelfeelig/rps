const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createTradeRequest,
  respondToTrade,
  finalizeTrade,
  getTrades,
  cancelTrade
} = require('../controllers/tradeController');

router.post('/request', authenticate, createTradeRequest);
router.post('/:id/respond', authenticate, respondToTrade);
router.post('/:id/finalize', authenticate, finalizeTrade);
router.post('/:id/cancel', authenticate, cancelTrade);
router.get('/', authenticate, getTrades);

module.exports = router;
