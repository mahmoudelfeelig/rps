const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createTradeRequest,
  respondToTrade,
  finalizeTrade,
  getTrades
} = require('../controllers/tradeController');

router.post('/request', authenticate, createTradeRequest); // User A initiates
router.post('/:id/respond', authenticate, respondToTrade); // User B responds with items
router.post('/:id/finalize', authenticate, finalizeTrade); // User A accepts final deal
router.get('/', authenticate, getTrades);

module.exports = router;
