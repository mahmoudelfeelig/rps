const express = require('express');
const router = express.Router();
const { getStoreItems, createStoreItem, purchaseItem, getUserStoreInfo, consumeItem } = require('../controllers/storeController');
const { authenticate, authorize } = require("../middleware/auth");
const upload = require('../middleware/upload');

router.get('/', getStoreItems);
router.get('/items', getStoreItems);
router.get('/user', authenticate, getUserStoreInfo);
router.post('/create', authenticate, authorize("admin"), createStoreItem);
router.post('/purchase', authenticate, purchaseItem);
router.post('/consume/:itemId', authenticate, consumeItem);
router.post(
  '/upload',
  authenticate,           // only logged-in (or admin) users
  upload.single('image'), // accepts field name “image”
  (req, res) => {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // req.file.path is the Cloudinary URL
    res.json({ url: req.file.path });
  }
);

module.exports = router;
