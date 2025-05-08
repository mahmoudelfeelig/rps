const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const shopCtrl = require('../controllers/shopController');

router.get('/items',          authenticate, shopCtrl.getPetItems);
router.post('/buy', authenticate, shopCtrl.buyPetItem);
router.post('/buy-cosmetic', authenticate, shopCtrl.buyCosmetic);
router.post('/buy-pet', authenticate, shopCtrl.buyPet);

module.exports = router;
