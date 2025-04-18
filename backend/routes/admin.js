const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.patch("/status/:type/:id", authenticate, authorize("admin"), adminController.updateStatus);
router.patch("/balance/:id", authenticate, authorize("admin"), adminController.modifyBalance);
router.patch("/odds/:id", authenticate, authorize("admin"), adminController.setOdds);
router.get("/logs", authenticate, authorize("admin"), adminController.viewLogs);

module.exports = router;
