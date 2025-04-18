const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/taskController");
const { createTask } = require('../controllers/taskController');

router.get("/", authenticate, controller.getAllTasks);
router.post("/complete", authenticate, controller.completeTask);
router.post('/create', authenticate, authorize('admin'), createTask);

module.exports = router;
