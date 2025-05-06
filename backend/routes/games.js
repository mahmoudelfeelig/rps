const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProgress,
  spinSpinner
} = require('../controllers/gameController');

router.get(
  '/progress',
  authenticate,
  getProgress
);

router.post(
  '/spinner',
  authenticate,
  spinSpinner
);

module.exports = router;
