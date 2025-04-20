const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/User");

const checkAndAwardBadges = require("../utils/checkAndAwardBadges");
const checkAndAwardAchievements = require("../utils/checkAndAwardAchievement");

router.get("/me", authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.username}!`, role: req.user.role });
});

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});

router.get("/group-dashboard", authenticate, authorize("groupAdmin"), (req, res) => {
  res.json({ message: "Group admin panel" });
});
router.get("/stats", authenticate, async (req, res) => {
  try {
    await checkAndAwardBadges(req.user.id);
    await checkAndAwardAchievements(req.user.id);
    
    const user = await User.findById(req.user.id)
      .populate('achievements')
      .populate({
        path: 'currentBets',
        select: 'title options predictions result',
      });

    const stats = {
      betsPlaced: user.betsPlaced,
      betsWon: user.betsWon,
      storePurchases: user.storePurchases,
      logins: user.loginCount,
      tasksCompleted: user.tasksCompleted,
      balance: user.balance,
      claimedAchievements: user.achievements,
      badges: user.badges || [],
      currentBets: user.currentBets || [],
    };

    res.json(stats);
  } catch (err) {
    console.error("Error in /stats:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});



module.exports = router;
