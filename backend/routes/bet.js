const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const betController = require("../controllers/betController");

router.post("/create", authenticate, betController.createBet);
router.post("/predict", authenticate, betController.placeBet);
router.post("/finalize", authenticate, authorize("admin"), betController.finalizeBet);
router.get("/history", authenticate, betController.getBetHistory);
router.get("/active", authenticate, betController.getActiveBets);
router.post("/parlay", authenticate, betController.placeParlayBet);
router.get('/:id', betController.getSingleBet);
router.get('/title/:title', authenticate, authorize('admin'), betController.getByTitle);

module.exports = router;
