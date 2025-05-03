const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const groupController = require("../controllers/groupController");
const { getTopGroups } = require('../controllers/leaderboardController')

router.post("/join/:groupId", authenticate, groupController.joinGroup);
router.get("/", authenticate, groupController.getAllGroups);
router.get("/:groupId", authenticate, groupController.getGroupDetails);
router.get('/top', getTopGroups)
router.post("/create", authenticate, authorize("admin"), groupController.createGroup);

module.exports = router;
