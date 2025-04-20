const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/User");



const checkAndAwardBadges = require("../utils/checkAndAwardBadges");
const checkAndAwardAchievements = require("../utils/checkAndAwardAchievement");

// // Image upload config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, '..', 'uploads');
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
//   }
// });
// const upload = multer({ storage });


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

// router.put('/update-profile', authenticate, upload.single('image'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (req.body.username) user.username = req.body.username;
//     if (req.body.email) user.email = req.body.email;
//     if (req.body.password) {
//       const hashed = await bcrypt.hash(req.body.password, 12);
//       user.password = hashed;
//     }

//     if (req.file) {
//       user.profileImage = `/uploads/${req.file.filename}`;
//     }

//     await user.save();

//     res.json({
//       message: 'Profile updated',
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profileImage: user.profileImage || null,
//         role: user.role,
//         balance: user.balance,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Update failed' });
//   }
// });


// // Request verification
// router.post("/verify-email", authenticate, async (req, res) => {
//   const token = crypto.randomBytes(32).toString("hex");
//   const expiry = Date.now() + 1000 * 60 * 30; // 30 minutes

//   const user = await User.findByIdAndUpdate(req.user.id, {
//     emailVerificationToken: token,
//     emailVerificationTokenExpiry: expiry,
//   });

//   const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
//   await sendEmail(user.email, "Verify your email", `<a href="${verificationLink}">Click to verify</a>`);

//   res.json({ message: "Verification email sent!" });
// });

// // Handle verification
// router.get("/verify-email/:token", async (req, res) => {
//   const user = await User.findOne({
//     emailVerificationToken: req.params.token,
//     emailVerificationTokenExpiry: { $gt: Date.now() },
//   });

//   if (!user) return res.status(400).json({ message: "Invalid or expired token" });

//   user.emailVerified = true;
//   user.emailVerificationToken = undefined;
//   user.emailVerificationTokenExpiry = undefined;
//   await user.save();

//   res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
// });

// Account deletion
router.delete("/delete-account", authenticate, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.clearCookie("token"); // optional, for cookie-based auth
  res.json({ message: "Account deleted successfully" });
});


module.exports = router;
