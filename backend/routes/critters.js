const express = require('express');
const router = express.Router();
const critterController = require('../controllers/critterController');
const { authenticate } = require('../middleware/auth');

router.post('/adopt', authenticate, critterController.adoptCritter);
router.get('/mine', authenticate, critterController.getMyCritters);
router.post('/feed/:id', authenticate, critterController.feedCritter);
router.post('/play/:id', authenticate, critterController.playWithCritter);
router.post('/equip-cosmetic', authenticate, critterController.equipCosmetic);
router.post('/evolve', authenticate, critterController.evolveCritter);

module.exports = router;
