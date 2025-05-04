const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/User");
const { updateUser, deleteUser, verifyEmail } = require('../controllers/userController')
const { sendMoney } = require('../controllers/userController')
const upload = require("../middleware/upload");
const { getTopUsers } = require('../controllers/leaderboardController')

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
      .populate('badges')
      .populate('inventory')
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
      inventory: user.inventory || [],
    };

    res.json({
      ...stats,
      userId: req.user.id
    });  } catch (err) {
    console.error("Error in /stats:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
    .select('username balance inventory betsPlaced achievements profileImage')
    .populate('inventory')
    .populate('achievements');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      balance: user.balance,
      profileImage: user.profileImage,
      inventory: user.inventory,
      betsPlaced: user.betsPlaced,
      achievements: user.achievements,
    });
  } catch (err) {
    console.error("Error in /public/:username:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get("/verify/:token", verifyEmail);
router.post('/update', authenticate, upload.single('image'), updateUser)
router.post('/delete', authenticate, deleteUser)
router.get('/top', getTopUsers)
router.post('/send-money', authenticate, sendMoney);


module.exports = router;
