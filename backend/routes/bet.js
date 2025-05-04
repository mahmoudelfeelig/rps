const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const betController = require("../controllers/betController");

router.post("/create", authenticate, betController.createBet);
router.post("/predict", authenticate, betController.placeBet);
router.post("/finalize", authenticate, betController.finalizeBet);
router.get("/history", authenticate, betController.getBetHistory);
router.get("/active", authenticate, betController.getActiveBets);
router.post("/parlay", authenticate, betController.placeParlayBet);
router.get('/title/:id', betController.getSingleBet);

module.exports = router;
