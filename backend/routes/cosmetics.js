const express = require('express');
const router = express.Router();
const cosmeticController = require('../controllers/cosmeticController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, cosmeticController.getAllCosmetics);

module.exports = router;
