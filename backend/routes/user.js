const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();

router.get("/me", authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.username}!`, role: req.user.role });
});

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});

router.get("/group-dashboard", authenticate, authorize("groupAdmin"), (req, res) => {
  res.json({ message: "Group admin panel" });
});

module.exports = router;
