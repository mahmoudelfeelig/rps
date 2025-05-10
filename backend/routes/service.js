const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const serviceController = require("../controllers/serviceController");

router.post("/", authenticate, serviceController.createService);
router.get("/", authenticate, serviceController.getAllServices);
router.delete("/:id", authenticate, serviceController.deleteServiceById);
router.put("/:id", authenticate, serviceController.updateServiceById);
router.post("/buy/:serviceId", authenticate, serviceController.buyService);
router.get("/purchases", authenticate, serviceController.getMyPurchases);
router.post("/finalize", authenticate, serviceController.finalizeService);
router.post("/accept", authenticate, serviceController.acceptFinalization);
router.get("/history", authenticate, serviceController.getMyHistory);

module.exports = router;