const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { createAchievement, getAllAchievements, completeAchievement } = require("../controllers/achievementController");

router.get("/", authenticate, getAllAchievements);
router.post("/complete", authenticate, completeAchievement);
router.post("/create", authenticate, authorize("admin"), createAchievement);

module.exports = router;
