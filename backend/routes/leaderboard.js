const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

router.get("/users", leaderboardController.getTopUsers);
router.get("/groups", leaderboardController.getTopGroups);

module.exports = router;
