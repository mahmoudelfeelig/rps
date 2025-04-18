const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const betController = require("../controllers/betController");

router.post("/create", authenticate, betController.createBet);
router.post("/predict", authenticate, betController.placeBet);
router.post("/finalize", authenticate, betController.finalizeBet);
router.get("/history", authenticate, betController.getBetHistory);

module.exports = router;
