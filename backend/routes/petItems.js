const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const shopCtrl = require('../controllers/shopController');

router.get('/',          authenticate, shopCtrl.getPetItems);
router.post('/buy',      authenticate, shopCtrl.buyPetItem);

module.exports = router;
