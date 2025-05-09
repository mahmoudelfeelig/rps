const express = require('express');
const router = express.Router();
const { getStoreItems, createStoreItem, purchaseItem, getUserStoreInfo, consumeItem } = require('../controllers/storeController');
const { authenticate, authorize } = require("../middleware/auth");

router.get('/', getStoreItems);
router.get('/items', getStoreItems);
router.get('/user', authenticate, getUserStoreInfo);
router.post('/create', authenticate, authorize("admin"), createStoreItem);
router.post('/purchase', authenticate, purchaseItem);
router.post('/consume/:itemId', authenticate, consumeItem);

module.exports = router;
