const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const traitCtrl = require('../controllers/traitController');

router.post('/unlock', authenticate, traitCtrl.unlockTrait);

module.exports = router;
