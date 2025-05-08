const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const breedCtrl = require('../controllers/breedingController');

router.post('/', authenticate, breedCtrl.breedCritters);

module.exports = router;
