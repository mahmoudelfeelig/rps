const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/auth');
const breeding = require('../controllers/breedingController');

// start a new breeding (creates an egg)
router.post('/critters/breed', authenticate, breeding.breedCritters);

// list your pending eggs
router.get('/eggs', authenticate, breeding.listEggs);

// hatch one egg (only if its hatchAt ≤ now)
router.post('/eggs/:id/hatch', authenticate, breeding.hatchEgg);

module.exports = router;
