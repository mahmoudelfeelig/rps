const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/auth');
const breeding = require('../controllers/breedingController');

router.post('/critters/breed', authenticate, breeding.breedCritters);

router.get('/eggs', authenticate, breeding.listEggs);

router.post('/eggs/:id/hatch', authenticate, breeding.hatchEgg);

module.exports = router;
