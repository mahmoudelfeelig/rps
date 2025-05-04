const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Update status by username (users) or ID (groups)
router.patch(
  "/status/:type/:identifier",
  authenticate,
  authorize("admin"),
  adminController.updateStatus
);

// Modify balance by username
router.patch(
  "/balance/:username",
  authenticate,
  authorize("admin"),
  adminController.modifyBalance
);

// Set odds by bet title
router.patch(
  "/odds/:title",
  authenticate,
  authorize("admin"),
  adminController.setOdds
);

// Get admin logs
router.get("/logs", authenticate, authorize("admin"), adminController.viewLogs);

module.exports = router;