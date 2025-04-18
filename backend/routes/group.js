const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

// Create group request (user)
router.post("/request", authenticate, async (req, res) => {
  const { name, rules, startingBalance } = req.body;

  try {
    const existing = await Group.findOne({ name });
    if (existing) return res.status(400).json({ message: "Group already exists" });

    const group = new Group({
      name,
      rules,
      startingBalance,
      admin: req.user.id,
      users: [req.user.id],
      approved: false,
    });

    await group.save();

    // Update user role to groupAdmin
    await User.findByIdAndUpdate(req.user.id, { role: "groupAdmin", group: group._id });

    res.status(201).json({ message: "Group request submitted for approval" });
  } catch (err) {
    res.status(500).json({ message: "Error creating group", error: err.message });
  }
});

// Admin approves group
router.post("/approve/:groupId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.approved = true;
    await group.save();

    res.json({ message: "Group approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error approving group", error: err.message });
  }
});

// Admin views all group requests
router.get("/requests", authenticate, authorize("admin"), async (req, res) => {
  const pendingGroups = await Group.find({ approved: false }).populate("admin", "username email");
  res.json(pendingGroups);
});

module.exports = router;
