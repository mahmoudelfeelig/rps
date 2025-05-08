const express      = require('express');
const { authenticate } = require('../middleware/auth');
const gachaCtrl    = require('../controllers/gachaController');
const router       = express.Router();

router.get( '/pools', authenticate, gachaCtrl.getPools);
router.post('/spin', authenticate, gachaCtrl.spin);

module.exports = router;