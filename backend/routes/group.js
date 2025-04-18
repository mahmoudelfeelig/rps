const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const groupController = require("../controllers/groupController");

// Join a group
router.post("/join/:groupId", authenticate, groupController.joinGroup);
router.get("/", authenticate, groupController.getAllGroups);
router.get("/:groupId", authenticate, groupController.getGroupDetails);

module.exports = router;
