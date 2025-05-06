const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.patch(
  "/status/:type/:identifier",
  authenticate,
  authorize("admin"),
  adminController.updateStatus
);

router.patch(
  "/balance/:username",
  authenticate,
  authorize("admin"),
  adminController.modifyBalance
);

router.get(
  "/odds/:title/options",
  authenticate,
  authorize("admin"),
  adminController.getBetOptions
);

router.patch(
  "/odds/:title/:optionId",
  authenticate,
  authorize("admin"),
  adminController.updateOptionOdds
);

router.get(
  "/users",
  authenticate,
  authorize("admin"),
  adminController.listUsers
);

router.get(
  "/bets",
  authenticate,
  authorize("admin"),
  adminController.listBets
);

router.get("/logs", authenticate, authorize("admin"), adminController.viewLogs);

module.exports = router;
