const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createTrade, acceptTrade, getTrades } = require('../controllers/tradeController');

router.post('/', authenticate, createTrade);
router.put('/:id/accept', authenticate, acceptTrade);
router.get('/', authenticate, getTrades);

module.exports = router;
